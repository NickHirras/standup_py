#!/usr/bin/env python3
"""
StandUp Backend Development Server
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    
    print("🚀 Starting StandUp Backend Server...")
    print(f"📡 API will be available at: http://localhost:8000")
    print(f"📚 API documentation at: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
