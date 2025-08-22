import os
import asyncio
from typing import List, Dict, Any
from dataclasses import dataclass
import pandas as pd
from datetime import datetime

# RAGAS imports
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy, 
    context_recall,
    context_precision
)
from ragas.llms import LangchainLLMWrapper
from langchain_openai import AzureChatOpenAI

from models.schemas import EvaluationRequest, TestCase
from services.azure_search_service import AzureSearchService

class RagasService:
    def __init__(self):
        self.search_service = AzureSearchService()
    
    def _create_llm_wrapper(self, model_config: Dict[str, Any]) -> LangchainLLMWrapper:
        """Create LangChain LLM wrapper for RAGAS"""
        azure_llm = AzureChatOpenAI(
            azure_endpoint=model_config["chat_endpoint"],
            api_version=model_config["api_version"],
            azure_deployment=model_config["deployment_name"],
            api_key=model_config["subscription_key"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"]
        )
        
        return LangchainLLMWrapper(azure_llm)
    
    async def _generate_answer(
        self, 
        question: str, 
        contexts: List[str], 
        model_config: Dict[str, Any],
        prompts: Dict[str, str]
    ) -> str:
        """Generate answer using LLM with retrieved contexts"""
        try:
            llm_wrapper = self._create_llm_wrapper(model_config)
            
            # Prepare context
            context_text = "\n\n".join(contexts)
            
            # Use RAG prompt template
            rag_prompt = prompts["rag_prompt"].format(
                context=context_text,
                question=question
            )
            
            # Generate answer
            response = llm_wrapper.llm.invoke(rag_prompt)
            return response.content if hasattr(response, 'content') else str(response)
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            return f"Error generating answer: {str(e)}"
    
    async def _retrieve_contexts(
        self, 
        question: str, 
        search_config: Dict[str, Any], 
        top_k: int
    ) -> List[str]:
        """Retrieve contexts from Azure Search for a given question"""
        return await self.search_service.get_document_contexts(
            search_endpoint=search_config["search_service_endpoint"],
            index_name=search_config["index_name"],
            query=question,
            top_k=top_k
        )
    
    async def run_evaluation(self, request: EvaluationRequest) -> Dict[str, Any]:
        """Run RAGAS evaluation with the provided configuration"""
        try:
            # Prepare evaluation data
            evaluation_data = []
            
            for test_case in request.test_cases:
                # Retrieve contexts for each question
                contexts = await self._retrieve_contexts(
                    question=test_case.question,
                    search_config=request.search_index.dict(),
                    top_k=request.model.top_k
                )
                
                # Generate answer using LLM
                answer = await self._generate_answer(
                    question=test_case.question,
                    contexts=contexts,
                    model_config=request.model.dict(),
                    prompts=request.prompts.dict()
                )
                
                # Prepare data for RAGAS evaluation
                eval_item = {
                    "question": test_case.question,
                    "answer": answer,
                    "contexts": contexts,
                    "ground_truth": test_case.ground_truth
                }
                evaluation_data.append(eval_item)
            
            # Convert to DataFrame for RAGAS
            df = pd.DataFrame(evaluation_data)
            
            # Create LLM wrapper for RAGAS metrics
            llm_wrapper = self._create_llm_wrapper(request.model.dict())
            
            # Configure RAGAS metrics with the LLM
            metrics = [
                faithfulness.with_llm(llm_wrapper),
                answer_relevancy.with_llm(llm_wrapper),
                context_recall.with_llm(llm_wrapper),
                context_precision.with_llm(llm_wrapper)
            ]
            
            # Run RAGAS evaluation
            result = evaluate(
                dataset=df,
                metrics=metrics
            )
            
            # Process results
            overall_metrics = {
                "faithfulness": float(result["faithfulness"]) if "faithfulness" in result else 0.0,
                "answer_relevancy": float(result["answer_relevancy"]) if "answer_relevancy" in result else 0.0,
                "context_recall": float(result["context_recall"]) if "context_recall" in result else 0.0,
                "context_precision": float(result["context_precision"]) if "context_precision" in result else 0.0
            }
            
            # Prepare detailed results for each test case
            test_case_results = []
            for i, test_case in enumerate(request.test_cases):
                case_result = {
                    "test_case_id": test_case.id,
                    "question": test_case.question,
                    "generated_answer": evaluation_data[i]["answer"],
                    "ground_truth": test_case.ground_truth,
                    "contexts": evaluation_data[i]["contexts"],
                    "metrics": {
                        "faithfulness": float(result.df.iloc[i]["faithfulness"]) if len(result.df) > i else 0.0,
                        "answer_relevancy": float(result.df.iloc[i]["answer_relevancy"]) if len(result.df) > i else 0.0,
                        "context_recall": float(result.df.iloc[i]["context_recall"]) if len(result.df) > i else 0.0,
                        "context_precision": float(result.df.iloc[i]["context_precision"]) if len(result.df) > i else 0.0,
                    }
                }
                test_case_results.append(case_result)
            
            return {
                "overall_metrics": overall_metrics,
                "test_case_results": test_case_results,
                "total_test_cases": len(request.test_cases),
                "evaluation_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error in RAGAS evaluation: {e}")
            raise Exception(f"RAGAS evaluation failed: {str(e)}")
