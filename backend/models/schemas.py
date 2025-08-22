from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class TestCase(BaseModel):
    id: str
    question: str
    answer: Optional[str] = ""
    citation: Optional[List[str]] = []
    ground_truth: str

class LLMConfig(BaseModel):
    name: str
    provider: str
    chat_endpoint: str
    deployment_name: str
    api_version: str
    subscription_key: str
    temperature: float = 0.5
    max_tokens: int = 1024

class SearchConfig(BaseModel):
    name: str
    search_service_endpoint: str

class ModelConfig(BaseModel):
    provider: str
    chat_endpoint: str
    deployment_name: str
    api_version: str
    subscription_key: str
    temperature: float
    top_k: int
    max_tokens: int

class SearchIndex(BaseModel):
    search_service_endpoint: str
    index_name: str

class Prompts(BaseModel):
    assistant_prompt: str
    rag_prompt: str

class EvaluationRequest(BaseModel):
    name: str
    model: ModelConfig
    search_index: SearchIndex
    prompts: Prompts
    test_cases: List[TestCase]

class EvaluationMetrics(BaseModel):
    faithfulness: float
    answer_relevancy: float
    context_recall: float
    context_precision: float

class EvaluationResult(BaseModel):
    evaluation_id: str
    name: str
    overall_metrics: EvaluationMetrics
    test_case_results: List[Dict[str, Any]]
    created_at: datetime
