from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import json
import os
from typing import List, Dict, Any
from datetime import datetime
import uuid

from services.cosmos_service import CosmosService
from services.azure_search_service import AzureSearchService
from services.ragas_service import RagasService
from models.schemas import (
    EvaluationRequest, 
    LLMConfig, 
    SearchConfig, 
    EvaluationResult,
    TestCase
)

app = FastAPI(title="AI Test App - RAGAS", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Initialize services
cosmos_service = CosmosService()
search_service = AzureSearchService()
ragas_service = RagasService()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("frontend/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.get("/sample-test-data")
async def download_sample_data():
    """Download sample test data JSON file"""
    sample_data = [
        {
            "id": "q1",
            "question": "What is BLUA?",
            "answer": "BLUA is the org app...",
            "citation": ["doc.pdf", "doc2.doc"],
            "ground_truth": "BLUA is ... (authoritative)"
        },
        {
            "id": "q2", 
            "question": "How does the refund policy work?",
            "answer": "The refund policy allows...",
            "citation": ["policy.pdf"],
            "ground_truth": "Refunds are processed within 7-14 business days..."
        }
    ]
    
    filename = "sample_test_data.json"
    with open(filename, "w") as f:
        json.dump(sample_data, f, indent=2)
    
    return FileResponse(
        filename, 
        media_type="application/json",
        filename="sample_test_data.json"
    )

@app.post("/upload-test-data")
async def upload_test_data(file: UploadFile = File(...)):
    """Upload and validate test data JSON file"""
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="File must be a JSON file")
    
    try:
        content = await file.read()
        test_data = json.loads(content)
        
        # Validate test data structure
        if not isinstance(test_data, list):
            raise HTTPException(status_code=400, detail="JSON must be an array of test cases")
        
        for item in test_data:
            required_fields = ['id', 'question', 'ground_truth']
            if not all(field in item for field in required_fields):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Each test case must have: {', '.join(required_fields)}"
                )
        
        return {"status": "success", "data": test_data, "count": len(test_data)}
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/llm-configs")
async def get_llm_configs():
    """Get all LLM configurations from Cosmos DB"""
    return await cosmos_service.get_configs("llm-config")

@app.get("/search-configs")
async def get_search_configs():
    """Get all search service configurations from Cosmos DB"""
    return await cosmos_service.get_configs("search-service")

@app.get("/search-indexes/{config_id}")
async def get_search_indexes(config_id: str):
    """Get all indexes from Azure Search service"""
    search_config = await cosmos_service.get_config_by_id(config_id)
    if not search_config:
        raise HTTPException(status_code=404, detail="Search configuration not found")
    
    return await search_service.get_indexes(search_config["search_service_endpoint"])

@app.post("/run-ragas")
async def run_ragas_evaluation(request: EvaluationRequest):
    """Run RAGAS evaluation with provided configuration and test cases"""
    try:
        # Run the evaluation
        result = await ragas_service.run_evaluation(request)
        
        # Store results in Cosmos DB
        evaluation_result = {
            "id": str(uuid.uuid4()),
            "type": "evaluation-result",
            "name": request.name,
            "config": request.dict(),
            "result": result,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        await cosmos_service.save_evaluation_result(evaluation_result)
        
        return {
            "status": "success",
            "evaluation_id": evaluation_result["id"],
            "result": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/evaluations")
async def get_evaluations():
    """Get all evaluation results"""
    return await cosmos_service.get_evaluation_results()

@app.get("/evaluations/{evaluation_id}")
async def get_evaluation(evaluation_id: str):
    """Get specific evaluation result"""
    result = await cosmos_service.get_evaluation_result(evaluation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return result

@app.post("/llm-configs")
async def create_llm_config(config: LLMConfig):
    """Create new LLM configuration"""
    config_dict = config.dict()
    config_dict["id"] = f"llm-{int(datetime.now().timestamp() * 1000)}"
    config_dict["type"] = "llm-config"
    config_dict["created_at"] = datetime.utcnow().isoformat()
    config_dict["updated_at"] = datetime.utcnow().isoformat()
    
    return await cosmos_service.save_config(config_dict)

@app.put("/llm-configs/{config_id}")
async def update_llm_config(config_id: str, config: LLMConfig):
    """Update LLM configuration"""
    existing = await cosmos_service.get_config_by_id(config_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    config_dict = config.dict()
    config_dict["id"] = config_id
    config_dict["type"] = "llm-config"
    config_dict["created_at"] = existing["created_at"]
    config_dict["updated_at"] = datetime.utcnow().isoformat()
    
    return await cosmos_service.save_config(config_dict)

@app.delete("/llm-configs/{config_id}")
async def delete_llm_config(config_id: str):
    """Delete LLM configuration"""
    return await cosmos_service.delete_config(config_id)

@app.post("/search-configs")
async def create_search_config(config: SearchConfig):
    """Create new search service configuration"""
    config_dict = config.dict()
    config_dict["id"] = f"search-{int(datetime.now().timestamp() * 1000)}"
    config_dict["type"] = "search-service"
    config_dict["created_at"] = datetime.utcnow().isoformat()
    config_dict["updated_at"] = datetime.utcnow().isoformat()
    
    return await cosmos_service.save_config(config_dict)

@app.put("/search-configs/{config_id}")
async def update_search_config(config_id: str, config: SearchConfig):
    """Update search service configuration"""
    existing = await cosmos_service.get_config_by_id(config_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    config_dict = config.dict()
    config_dict["id"] = config_id
    config_dict["type"] = "search-service"
    config_dict["created_at"] = existing["created_at"]
    config_dict["updated_at"] = datetime.utcnow().isoformat()
    
    return await cosmos_service.save_config(config_dict)

@app.delete("/search-configs/{config_id}")
async def delete_search_config(config_id: str):
    """Delete search service configuration"""
    return await cosmos_service.delete_config(config_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
