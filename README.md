# AI Test App - RAGAS

A comprehensive web application for evaluating Retrieval Augmented Generation (RAG) systems using the RAGAS framework. This app provides a user-friendly interface to upload test data, configure LLM and search services, run evaluations, and compare results.

## Features

### 🏠 Dashboard
- Overview of evaluation history
- Key metrics and statistics
- Recent evaluations summary

### 📊 RAG Evaluation
- Upload JSON test data files
- Configure LLM models (Azure OpenAI, OpenAI)
- Configure Azure Cognitive Search services
- Run RAGAS evaluations with metrics:
  - **Faithfulness**: Is the answer faithful to the retrieved context?
  - **Answer Relevancy**: Does the answer directly address the question?
  - **Context Recall**: Do the retrieved contexts cover the ground truth?
  - **Context Precision**: Are the retrieved contexts focused (not noisy)?

### ⚖️ Compare RAG
- Compare results from different evaluations
- Side-by-side metric comparisons
- Difference analysis

### ⚙️ Settings
- Manage LLM configurations
- Manage search service configurations
- CRUD operations for all configurations

## Architecture

### Backend (Python)
- **FastAPI**: Modern, fast web framework for building APIs
- **RAGAS**: Evaluation framework for RAG systems
- **Azure SDK**: Integration with Azure services
- **LangChain**: LLM abstraction layer

### Frontend (HTML/JS)
- **Bootstrap 5**: Responsive UI framework
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Custom styling with animations

### Azure Services
- **Azure Cosmos DB**: Store configurations and evaluation results
- **Azure Cognitive Search**: Document retrieval for RAG
- **Azure OpenAI**: LLM inference

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Azure account with access to:
  - Azure Cosmos DB
  - Azure Cognitive Search
  - Azure OpenAI (optional)

### 1. Clone and Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your Azure credentials:

```env
# Azure Cosmos DB Configuration
COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_KEY=your-cosmos-primary-key
COSMOS_DATABASE_NAME=ragas_db
COSMOS_CONTAINER_NAME=configurations
```

### 3. Azure Authentication

The application uses Azure Default Credentials for authentication with Azure Search. Ensure you're authenticated via:

- Azure CLI: `az login`
- Service Principal environment variables
- Managed Identity (when deployed to Azure)

### 4. Start the Application

```bash
# Using npm (recommended for development)
npm run dev

# Or directly with Python
python start.py
```

The application will be available at `http://localhost:8000`

## Usage Guide

### 1. Setup Configurations

Before running evaluations, set up your configurations in the **Settings** page:

#### LLM Configuration
- Name: Descriptive name for the configuration
- Provider: `azure-openai` or `openai`
- Chat Endpoint: Your Azure OpenAI endpoint
- Deployment Name: Model deployment name
- API Version: API version (e.g., `2024-02-15-preview`)
- Subscription Key: Your API key
- Temperature: Model temperature (0.0 - 2.0)
- Max Tokens: Maximum tokens for responses

#### Search Configuration
- Name: Descriptive name for the search service
- Search Service Endpoint: Your Azure Search endpoint

### 2. Prepare Test Data

Create a JSON file with your test cases:

```json
[
  {
    "id": "q1",
    "question": "What is BLUA?",
    "answer": "BLUA is the org app...",
    "citation": ["doc.pdf", "doc2.doc"],
    "ground_truth": "BLUA is ... (authoritative)"
  }
]
```

Or download the sample file from the evaluation page.

### 3. Run Evaluation

1. Go to **RAG Evaluation** page
2. Upload your test data JSON file
3. Configure the evaluation:
   - Evaluation Name
   - Select LLM Configuration
   - Select RAGAS LLM Configuration
   - Select Search Configuration
   - Choose Search Index
   - Set Assistant and RAG prompts
   - Configure Top K and Temperature
4. Click **Run RAGAS Evaluation**

### 4. View Results

Results include:
- Overall metrics (faithfulness, relevancy, recall, precision)
- Detailed per-test-case results
- Generated answers vs ground truth
- Retrieved contexts

### 5. Compare Evaluations

Use the **Compare RAG** page to:
- Select two evaluations
- View side-by-side metrics
- Analyze performance differences

## API Endpoints

### Evaluations
- `POST /run-ragas` - Run RAGAS evaluation
- `GET /evaluations` - Get all evaluations
- `GET /evaluations/{id}` - Get specific evaluation

### Configurations
- `GET /llm-configs` - Get LLM configurations
- `POST /llm-configs` - Create LLM configuration
- `PUT /llm-configs/{id}` - Update LLM configuration
- `DELETE /llm-configs/{id}` - Delete LLM configuration
- `GET /search-configs` - Get search configurations
- `POST /search-configs` - Create search configuration
- `PUT /search-configs/{id}` - Update search configuration
- `DELETE /search-configs/{id}` - Delete search configuration

### Utilities
- `GET /sample-test-data` - Download sample test data
- `POST /upload-test-data` - Upload and validate test data
- `GET /search-indexes/{config_id}` - Get search indexes

## RAGAS Metrics Explained

### Faithfulness
Measures whether the generated answer is faithful to the retrieved context. High faithfulness means the answer doesn't hallucinate information not present in the context.

### Answer Relevancy
Evaluates how well the generated answer addresses the original question. High relevancy means the answer directly answers what was asked.

### Context Recall
Measures how well the retrieved contexts cover the information needed to answer the question (based on ground truth). High recall means important information wasn't missed.

### Context Precision
Evaluates whether the retrieved contexts are focused and relevant. High precision means less noise in the retrieved information.

## Troubleshooting

### Common Issues

1. **Azure Authentication Errors**
   - Ensure you're logged in via `az login`
   - Check your Azure permissions for Cosmos DB and Search

2. **Module Import Errors**
   - Verify all dependencies are installed: `pip install -r requirements.txt`
   - Check Python path configuration

3. **RAGAS Evaluation Failures**
   - Verify LLM configuration credentials
   - Check search service connectivity
   - Ensure test data format is correct

4. **Database Connection Issues**
   - Verify Cosmos DB endpoint and key
   - Check network connectivity to Azure services

### Debug Mode

Set `PYTHONPATH=./backend` and run with debug logging:

```bash
python -m uvicorn backend.main:app --reload --log-level debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Azure service documentation
3. Open an issue in the repository

---

**Note**: This application requires Azure services and may incur costs. Please review Azure pricing for Cosmos DB, Cognitive Search, and OpenAI services.
