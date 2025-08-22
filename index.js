const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the main HTML file
    fs.readFile(path.join(__dirname, 'frontend', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else if (req.url === '/app.js') {
    // Serve JavaScript file
    fs.readFile(path.join(__dirname, 'frontend', 'app.js'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('app.js not found');
        return;
      }
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(data);
    });
  } else if (req.url === '/styles.css') {
    // Serve CSS file
    fs.readFile(path.join(__dirname, 'frontend', 'styles.css'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('styles.css not found');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.end(data);
    });
  } else {
    // For all other requests, show setup instructions
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Test App - RAGAS Setup</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { background-color: #f8f9fa; padding: 2rem; }
          .setup-card { max-width: 800px; margin: 0 auto; }
          .code-block { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0.375rem; padding: 1rem; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card setup-card">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">🤖 AI Test App - RAGAS</h3>
            </div>
            <div class="card-body">
              <div class="alert alert-info">
                <h5>⚠️ Setup Required</h5>
                <p>This is a Python-based RAGAS evaluation application. The frontend is ready, but you need to set up the Python backend.</p>
              </div>

              <h5>📋 Setup Instructions:</h5>
              <ol>
                <li><strong>Install Python Dependencies:</strong>
                  <div class="code-block mt-2 mb-3">pip install -r requirements.txt</div>
                </li>

                <li><strong>Configure Environment Variables:</strong>
                  <div class="code-block mt-2 mb-3">
                    # Copy the example file<br>
                    cp .env.example .env<br><br>
                    # Edit .env with your Azure credentials:<br>
                    COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/<br>
                    COSMOS_KEY=your-cosmos-primary-key<br>
                    COSMOS_DATABASE_NAME=ragas_db<br>
                    COSMOS_CONTAINER_NAME=configurations
                  </div>
                </li>

                <li><strong>Azure Authentication:</strong>
                  <div class="code-block mt-2 mb-3">az login</div>
                  <small class="text-muted">Required for Azure Cognitive Search access</small>
                </li>

                <li><strong>Start the Python Backend:</strong>
                  <div class="code-block mt-2 mb-3">python start.py</div>
                  <small class="text-muted">This will start the FastAPI backend on port 8000</small>
                </li>
              </ol>

              <div class="alert alert-success">
                <h6>📁 Project Structure:</h6>
                <ul class="mb-0">
                  <li><code>backend/</code> - Python FastAPI backend with RAGAS integration</li>
                  <li><code>frontend/</code> - HTML/CSS/JS frontend</li>
                  <li><code>requirements.txt</code> - Python dependencies</li>
                  <li><code>.env.example</code> - Environment variables template</li>
                  <li><code>README.md</code> - Comprehensive documentation</li>
                </ul>
              </div>

              <div class="alert alert-warning">
                <h6>🔐 Required Azure Services:</h6>
                <ul class="mb-0">
                  <li><strong>Azure Cosmos DB</strong> - Store configurations and results</li>
                  <li><strong>Azure Cognitive Search</strong> - Document retrieval</li>
                  <li><strong>Azure OpenAI</strong> - LLM inference (optional)</li>
                </ul>
              </div>

              <hr>

              <h5>🚀 Features Implemented:</h5>
              <div class="row">
                <div class="col-md-6">
                  <ul>
                    <li>✅ Dashboard with metrics</li>
                    <li>✅ RAG Evaluation with RAGAS</li>
                    <li>✅ JSON test data upload</li>
                    <li>✅ LLM configuration management</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul>
                    <li>✅ Search service integration</li>
                    <li>✅ Evaluation comparison</li>
                    <li>✅ Results storage in Cosmos DB</li>
                    <li>✅ Responsive UI design</li>
                  </ul>
                </div>
              </div>

              <div class="mt-3">
                <a href="/" class="btn btn-primary">🏠 View Frontend Demo</a>
                <a href="/README.md" class="btn btn-outline-secondary">📖 Full Documentation</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`AI Test App - RAGAS Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for setup instructions`);
  console.log(`Frontend demo available at http://localhost:${PORT}/`);
});
