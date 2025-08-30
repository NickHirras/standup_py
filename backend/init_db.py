#!/usr/bin/env python3
"""
Standalone database initialization script
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def init_database():
    try:
        print("🗄️ Initializing database...")
        
        # Import after setting up the path
        from app.core.database import init_db, Base
        from app.models import User, Company, Team  # Import models to register them
        
        # Create data directory
        os.makedirs("./data", exist_ok=True)
        
        # Initialize database
        init_db()
        
        print("✅ Database initialized successfully!")
        print("📁 Database file created at: ./data/standup.db")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    init_database()
