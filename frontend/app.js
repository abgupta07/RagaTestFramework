// Global variables
let testData = [];
let llmConfigs = [];
let searchConfigs = [];
let evaluations = [];

// API base URL
const API_BASE = '';

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.remove('d-none');
    
    // Update navbar active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[onclick="showPage('${pageId}')"]`).classList.add('active');
    
    // Load page-specific data
    switch(pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'evaluation':
            loadEvaluationPage();
            break;
        case 'compare':
            loadComparePage();
            break;
        case 'settings':
            loadSettingsPage();
            break;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    showPage('dashboard');
});

// Dashboard functions
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/evaluations`);
        evaluations = await response.json();
        
        updateDashboardStats();
        updateRecentEvaluations();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateDashboardStats() {
    const totalEvaluations = evaluations.length;
    
    let avgFaithfulness = 0;
    let avgRelevancy = 0;
    let lastEvaluation = 'Never';
    
    if (totalEvaluations > 0) {
        const faithfulnessSum = evaluations.reduce((sum, eval) => 
            sum + (eval.result?.overall_metrics?.faithfulness || 0), 0);
        const relevancySum = evaluations.reduce((sum, eval) => 
            sum + (eval.result?.overall_metrics?.answer_relevancy || 0), 0);
        
        avgFaithfulness = (faithfulnessSum / totalEvaluations).toFixed(2);
        avgRelevancy = (relevancySum / totalEvaluations).toFixed(2);
        
        const latest = evaluations[0];
        lastEvaluation = new Date(latest.created_at).toLocaleDateString();
    }
    
    document.getElementById('total-evaluations').textContent = totalEvaluations;
    document.getElementById('avg-faithfulness').textContent = avgFaithfulness;
    document.getElementById('avg-relevancy').textContent = avgRelevancy;
    document.getElementById('last-evaluation').textContent = lastEvaluation;
}

function updateRecentEvaluations() {
    const tbody = document.getElementById('recent-evaluations');
    
    if (evaluations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">No evaluations found</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = evaluations.slice(0, 10).map(eval => {
        const metrics = eval.result?.overall_metrics || {};
        const date = new Date(eval.created_at).toLocaleDateString();
        
        return `
            <tr>
                <td>${eval.name}</td>
                <td>${date}</td>
                <td><span class="badge ${getMetricClass(metrics.faithfulness)}">${(metrics.faithfulness || 0).toFixed(2)}</span></td>
                <td><span class="badge ${getMetricClass(metrics.answer_relevancy)}">${(metrics.answer_relevancy || 0).toFixed(2)}</span></td>
                <td><span class="badge ${getMetricClass(metrics.context_recall)}">${(metrics.context_recall || 0).toFixed(2)}</span></td>
                <td><span class="badge ${getMetricClass(metrics.context_precision)}">${(metrics.context_precision || 0).toFixed(2)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewEvaluation('${eval.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getMetricClass(value) {
    if (value >= 0.8) return 'metric-excellent';
    if (value >= 0.6) return 'metric-good';
    if (value >= 0.4) return 'metric-fair';
    return 'metric-poor';
}

// Evaluation page functions
async function loadEvaluationPage() {
    await loadConfigs();
}

async function loadConfigs() {
    try {
        const [llmResponse, searchResponse] = await Promise.all([
            fetch(`${API_BASE}/llm-configs`),
            fetch(`${API_BASE}/search-configs`)
        ]);
        
        llmConfigs = await llmResponse.json();
        searchConfigs = await searchResponse.json();
        
        populateConfigSelectors();
    } catch (error) {
        console.error('Error loading configs:', error);
        showAlert('Error loading configurations', 'danger');
    }
}

function populateConfigSelectors() {
    const llmSelect = document.getElementById('llm-config');
    const ragasLlmSelect = document.getElementById('ragas-llm-config');
    const searchSelect = document.getElementById('search-config');
    
    // Clear existing options
    llmSelect.innerHTML = '<option value="">Select LLM Configuration</option>';
    ragasLlmSelect.innerHTML = '<option value="">Select RAGAS LLM Configuration</option>';
    searchSelect.innerHTML = '<option value="">Select Search Configuration</option>';
    
    // Populate LLM configs
    llmConfigs.forEach(config => {
        const option = `<option value="${config.id}">${config.name}</option>`;
        llmSelect.innerHTML += option;
        ragasLlmSelect.innerHTML += option;
    });
    
    // Populate search configs
    searchConfigs.forEach(config => {
        const option = `<option value="${config.id}">${config.name}</option>`;
        searchSelect.innerHTML += option;
    });
}

async function downloadSample() {
    try {
        const response = await fetch(`${API_BASE}/sample-test-data`);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_test_data.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading sample:', error);
        showAlert('Error downloading sample file', 'danger');
    }
}

async function uploadTestData() {
    const fileInput = document.getElementById('test-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Please select a JSON file', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/upload-test-data`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            testData = result.data;
            displayTestDataPreview();
            showAlert(`Successfully uploaded ${result.count} test cases`, 'success');
        } else {
            showAlert(result.detail || 'Error uploading file', 'danger');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showAlert('Error uploading file', 'danger');
    }
}

function displayTestDataPreview() {
    const preview = document.getElementById('test-data-preview');
    const tbody = document.getElementById('test-data-table');
    
    tbody.innerHTML = testData.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.question.substring(0, 50)}${item.question.length > 50 ? '...' : ''}</td>
            <td>${item.ground_truth.substring(0, 50)}${item.ground_truth.length > 50 ? '...' : ''}</td>
        </tr>
    `).join('');
    
    preview.style.display = 'block';
}

async function loadIndexes() {
    const searchConfigId = document.getElementById('search-config').value;
    const indexSelect = document.getElementById('index-name');
    
    if (!searchConfigId) {
        indexSelect.innerHTML = '<option value="">Select Search Configuration First</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/search-indexes/${searchConfigId}`);
        const indexes = await response.json();
        
        indexSelect.innerHTML = '<option value="">Select Index</option>';
        indexes.forEach(index => {
            indexSelect.innerHTML += `<option value="${index.name}">${index.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading indexes:', error);
        showAlert('Error loading search indexes', 'danger');
    }
}

async function runEvaluation() {
    if (testData.length === 0) {
        showAlert('Please upload test data first', 'warning');
        return;
    }
    
    const form = document.getElementById('evaluation-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const runBtn = document.getElementById('run-btn');
    const originalText = runBtn.innerHTML;
    runBtn.innerHTML = '<span class="loading-spinner"></span> Running Evaluation...';
    runBtn.disabled = true;
    
    try {
        const llmConfigId = document.getElementById('llm-config').value;
        const searchConfigId = document.getElementById('search-config').value;
        
        const llmConfig = llmConfigs.find(c => c.id === llmConfigId);
        const searchConfig = searchConfigs.find(c => c.id === searchConfigId);
        
        const payload = {
            name: document.getElementById('evaluation-name').value,
            model: {
                provider: llmConfig.provider,
                chat_endpoint: llmConfig.chat_endpoint,
                deployment_name: llmConfig.deployment_name,
                api_version: llmConfig.api_version,
                subscription_key: llmConfig.subscription_key,
                temperature: parseFloat(document.getElementById('temperature').value),
                top_k: parseInt(document.getElementById('top-k').value),
                max_tokens: llmConfig.max_tokens
            },
            search_index: {
                search_service_endpoint: searchConfig.search_service_endpoint,
                index_name: document.getElementById('index-name').value
            },
            prompts: {
                assistant_prompt: document.getElementById('assistant-prompt').value,
                rag_prompt: document.getElementById('rag-prompt').value || 
                           "Use the context below to answer.\n{context}\n\nQuestion: {question}"
            },
            test_cases: testData
        };
        
        const response = await fetch(`${API_BASE}/run-ragas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayResults(result.result);
            showAlert('Evaluation completed successfully!', 'success');
        } else {
            showAlert(result.detail || 'Error running evaluation', 'danger');
        }
    } catch (error) {
        console.error('Error running evaluation:', error);
        showAlert('Error running evaluation', 'danger');
    } finally {
        runBtn.innerHTML = originalText;
        runBtn.disabled = false;
    }
}

function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    
    const metrics = results.overall_metrics;
    
    resultsContent.innerHTML = `
        <div class="results-metrics">
            <div class="metric-card">
                <div class="metric-value">${metrics.faithfulness.toFixed(3)}</div>
                <div class="metric-label">Faithfulness</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.answer_relevancy.toFixed(3)}</div>
                <div class="metric-label">Answer Relevancy</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.context_recall.toFixed(3)}</div>
                <div class="metric-label">Context Recall</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.context_precision.toFixed(3)}</div>
                <div class="metric-label">Context Precision</div>
            </div>
        </div>
        
        <h5>Detailed Results</h5>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Test Case</th>
                        <th>Question</th>
                        <th>Generated Answer</th>
                        <th>Faithfulness</th>
                        <th>Relevancy</th>
                        <th>Context Recall</th>
                        <th>Context Precision</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.test_case_results.map(result => `
                        <tr>
                            <td>${result.test_case_id}</td>
                            <td>${result.question.substring(0, 50)}...</td>
                            <td>${result.generated_answer.substring(0, 50)}...</td>
                            <td><span class="badge ${getMetricClass(result.metrics.faithfulness)}">${result.metrics.faithfulness.toFixed(3)}</span></td>
                            <td><span class="badge ${getMetricClass(result.metrics.answer_relevancy)}">${result.metrics.answer_relevancy.toFixed(3)}</span></td>
                            <td><span class="badge ${getMetricClass(result.metrics.context_recall)}">${result.metrics.context_recall.toFixed(3)}</span></td>
                            <td><span class="badge ${getMetricClass(result.metrics.context_precision)}">${result.metrics.context_precision.toFixed(3)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    resultsSection.style.display = 'block';
}

// Compare page functions
async function loadComparePage() {
    const eval1Select = document.getElementById('comparison-eval1');
    const eval2Select = document.getElementById('comparison-eval2');
    
    eval1Select.innerHTML = '<option value="">Select First Evaluation</option>';
    eval2Select.innerHTML = '<option value="">Select Second Evaluation</option>';
    
    evaluations.forEach(eval => {
        const option = `<option value="${eval.id}">${eval.name} (${new Date(eval.created_at).toLocaleDateString()})</option>`;
        eval1Select.innerHTML += option;
        eval2Select.innerHTML += option;
    });
}

async function compareEvaluations() {
    const eval1Id = document.getElementById('comparison-eval1').value;
    const eval2Id = document.getElementById('comparison-eval2').value;
    
    if (!eval1Id || !eval2Id) {
        showAlert('Please select two evaluations to compare', 'warning');
        return;
    }
    
    if (eval1Id === eval2Id) {
        showAlert('Please select different evaluations', 'warning');
        return;
    }
    
    try {
        const [response1, response2] = await Promise.all([
            fetch(`${API_BASE}/evaluations/${eval1Id}`),
            fetch(`${API_BASE}/evaluations/${eval2Id}`)
        ]);
        
        const eval1 = await response1.json();
        const eval2 = await response2.json();
        
        displayComparison(eval1, eval2);
    } catch (error) {
        console.error('Error comparing evaluations:', error);
        showAlert('Error loading evaluation data', 'danger');
    }
}

function displayComparison(eval1, eval2) {
    const resultsDiv = document.getElementById('comparison-results');
    
    const metrics1 = eval1.result.overall_metrics;
    const metrics2 = eval2.result.overall_metrics;
    
    resultsDiv.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Comparison Results</h5>
            </div>
            <div class="card-body">
                <div class="comparison-card">
                    <div class="comparison-header">${eval1.name}</div>
                    <div class="comparison-metrics">
                        <span class="badge metric-badge ${getMetricClass(metrics1.faithfulness)}">Faithfulness: ${metrics1.faithfulness.toFixed(3)}</span>
                        <span class="badge metric-badge ${getMetricClass(metrics1.answer_relevancy)}">Relevancy: ${metrics1.answer_relevancy.toFixed(3)}</span>
                        <span class="badge metric-badge ${getMetricClass(metrics1.context_recall)}">Recall: ${metrics1.context_recall.toFixed(3)}</span>
                        <span class="badge metric-badge ${getMetricClass(metrics1.context_precision)}">Precision: ${metrics1.context_precision.toFixed(3)}</span>
                    </div>
                </div>
                
                <div class="comparison-card">
                    <div class="comparison-header">${eval2.name}</div>
                    <div class="comparison-metrics">
                        <span class="badge metric-badge ${getMetricClass(metrics2.faithfulness)}">Faithfulness: ${metrics2.faithfulness.toFixed(3)}</span>
                        <span class="badge metric-badge ${getMetricClass(metrics2.answer_relevancy)}">Relevancy: ${metrics2.answer_relevancy.toFixed(3)}</span>
                        <span class="badge metric-badge ${getMetricClass(metrics2.context_recall)}">Recall: ${metrics2.context_recall.toFixed(3)}</span>
                        <span class="badge metric-badge ${getMetricClass(metrics2.context_precision)}">Precision: ${metrics2.context_precision.toFixed(3)}</span>
                    </div>
                </div>
                
                <h6 class="mt-3">Metric Differences</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>${eval1.name}</th>
                                <th>${eval2.name}</th>
                                <th>Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Faithfulness</td>
                                <td>${metrics1.faithfulness.toFixed(3)}</td>
                                <td>${metrics2.faithfulness.toFixed(3)}</td>
                                <td class="${(metrics1.faithfulness - metrics2.faithfulness) > 0 ? 'text-success' : 'text-danger'}">
                                    ${(metrics1.faithfulness - metrics2.faithfulness).toFixed(3)}
                                </td>
                            </tr>
                            <tr>
                                <td>Answer Relevancy</td>
                                <td>${metrics1.answer_relevancy.toFixed(3)}</td>
                                <td>${metrics2.answer_relevancy.toFixed(3)}</td>
                                <td class="${(metrics1.answer_relevancy - metrics2.answer_relevancy) > 0 ? 'text-success' : 'text-danger'}">
                                    ${(metrics1.answer_relevancy - metrics2.answer_relevancy).toFixed(3)}
                                </td>
                            </tr>
                            <tr>
                                <td>Context Recall</td>
                                <td>${metrics1.context_recall.toFixed(3)}</td>
                                <td>${metrics2.context_recall.toFixed(3)}</td>
                                <td class="${(metrics1.context_recall - metrics2.context_recall) > 0 ? 'text-success' : 'text-danger'}">
                                    ${(metrics1.context_recall - metrics2.context_recall).toFixed(3)}
                                </td>
                            </tr>
                            <tr>
                                <td>Context Precision</td>
                                <td>${metrics1.context_precision.toFixed(3)}</td>
                                <td>${metrics2.context_precision.toFixed(3)}</td>
                                <td class="${(metrics1.context_precision - metrics2.context_precision) > 0 ? 'text-success' : 'text-danger'}">
                                    ${(metrics1.context_precision - metrics2.context_precision).toFixed(3)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
}

// Settings page functions
async function loadSettingsPage() {
    await loadConfigs();
    displayLLMConfigs();
    displaySearchConfigs();
}

function displayLLMConfigs() {
    const container = document.getElementById('llm-configs-list');
    
    if (llmConfigs.length === 0) {
        container.innerHTML = '<p class="text-muted">No LLM configurations found</p>';
        return;
    }
    
    container.innerHTML = llmConfigs.map(config => `
        <div class="config-item">
            <div class="config-header">
                <span class="config-name">${config.name}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="editLLMConfig('${config.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteLLMConfig('${config.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="config-details">
                <strong>Provider:</strong> ${config.provider}<br>
                <strong>Endpoint:</strong> ${config.chat_endpoint}<br>
                <strong>Deployment:</strong> ${config.deployment_name}
            </div>
        </div>
    `).join('');
}

function displaySearchConfigs() {
    const container = document.getElementById('search-configs-list');
    
    if (searchConfigs.length === 0) {
        container.innerHTML = '<p class="text-muted">No search configurations found</p>';
        return;
    }
    
    container.innerHTML = searchConfigs.map(config => `
        <div class="config-item">
            <div class="config-header">
                <span class="config-name">${config.name}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="editSearchConfig('${config.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSearchConfig('${config.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="config-details">
                <strong>Endpoint:</strong> ${config.search_service_endpoint}
            </div>
        </div>
    `).join('');
}

// LLM Configuration functions
function showLLMForm(configId = null) {
    const modal = new bootstrap.Modal(document.getElementById('llmConfigModal'));
    const form = document.getElementById('llm-form');
    
    if (configId) {
        const config = llmConfigs.find(c => c.id === configId);
        if (config) {
            document.getElementById('llm-id').value = config.id;
            document.getElementById('llm-name').value = config.name;
            document.getElementById('llm-provider').value = config.provider;
            document.getElementById('llm-endpoint').value = config.chat_endpoint;
            document.getElementById('llm-deployment').value = config.deployment_name;
            document.getElementById('llm-api-version').value = config.api_version;
            document.getElementById('llm-subscription-key').value = config.subscription_key;
            document.getElementById('llm-temperature').value = config.temperature;
            document.getElementById('llm-max-tokens').value = config.max_tokens;
        }
    } else {
        form.reset();
        document.getElementById('llm-id').value = '';
    }
    
    modal.show();
}

function editLLMConfig(configId) {
    showLLMForm(configId);
}

async function saveLLMConfig() {
    const form = document.getElementById('llm-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const configId = document.getElementById('llm-id').value;
    const configData = {
        name: document.getElementById('llm-name').value,
        provider: document.getElementById('llm-provider').value,
        chat_endpoint: document.getElementById('llm-endpoint').value,
        deployment_name: document.getElementById('llm-deployment').value,
        api_version: document.getElementById('llm-api-version').value,
        subscription_key: document.getElementById('llm-subscription-key').value,
        temperature: parseFloat(document.getElementById('llm-temperature').value),
        max_tokens: parseInt(document.getElementById('llm-max-tokens').value)
    };
    
    try {
        const url = configId ? `${API_BASE}/llm-configs/${configId}` : `${API_BASE}/llm-configs`;
        const method = configId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(configData)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('llmConfigModal'));
            modal.hide();
            showAlert('LLM configuration saved successfully', 'success');
            await loadConfigs();
            displayLLMConfigs();
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error saving configuration', 'danger');
        }
    } catch (error) {
        console.error('Error saving LLM config:', error);
        showAlert('Error saving configuration', 'danger');
    }
}

async function deleteLLMConfig(configId) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/llm-configs/${configId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Configuration deleted successfully', 'success');
            await loadConfigs();
            displayLLMConfigs();
        } else {
            showAlert('Error deleting configuration', 'danger');
        }
    } catch (error) {
        console.error('Error deleting LLM config:', error);
        showAlert('Error deleting configuration', 'danger');
    }
}

// Search Configuration functions
function showSearchForm(configId = null) {
    const modal = new bootstrap.Modal(document.getElementById('searchConfigModal'));
    const form = document.getElementById('search-form');
    
    if (configId) {
        const config = searchConfigs.find(c => c.id === configId);
        if (config) {
            document.getElementById('search-id').value = config.id;
            document.getElementById('search-name').value = config.name;
            document.getElementById('search-endpoint').value = config.search_service_endpoint;
        }
    } else {
        form.reset();
        document.getElementById('search-id').value = '';
    }
    
    modal.show();
}

function editSearchConfig(configId) {
    showSearchForm(configId);
}

async function saveSearchConfig() {
    const form = document.getElementById('search-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const configId = document.getElementById('search-id').value;
    const configData = {
        name: document.getElementById('search-name').value,
        search_service_endpoint: document.getElementById('search-endpoint').value
    };
    
    try {
        const url = configId ? `${API_BASE}/search-configs/${configId}` : `${API_BASE}/search-configs`;
        const method = configId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(configData)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('searchConfigModal'));
            modal.hide();
            showAlert('Search configuration saved successfully', 'success');
            await loadConfigs();
            displaySearchConfigs();
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error saving configuration', 'danger');
        }
    } catch (error) {
        console.error('Error saving search config:', error);
        showAlert('Error saving configuration', 'danger');
    }
}

async function deleteSearchConfig(configId) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/search-configs/${configId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Configuration deleted successfully', 'success');
            await loadConfigs();
            displaySearchConfigs();
        } else {
            showAlert('Error deleting configuration', 'danger');
        }
    } catch (error) {
        console.error('Error deleting search config:', error);
        showAlert('Error deleting configuration', 'danger');
    }
}

// Utility functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the current page
    const currentPage = document.querySelector('.page:not(.d-none)');
    currentPage.insertBefore(alertDiv, currentPage.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function viewEvaluation(evaluationId) {
    // This would typically open a detailed view of the evaluation
    console.log('View evaluation:', evaluationId);
    showAlert('Detailed view not implemented yet', 'info');
}
