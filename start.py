#!/usr/bin/env python3
"""
AI Test App - RAGAS
Startup script for the Python backend
"""

import sys
import os
import subprocess

# Add backend to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Check if running in development or production
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    
    # Start uvicorn server
    try:
        import uvicorn
        uvicorn.run(
            "backend.main:app", 
            host="0.0.0.0", 
            port=port,
            reload=True,  # Enable auto-reload for development
            log_level="info"
        )
    except ImportError:
        print("Error: uvicorn not installed. Please run: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
