#!/bin/bash

echo "🚀 Setting up StandUp development environment..."

# Check if backend directory exists
if [ -d "/workspace/backend" ]; then
    echo "📦 Installing Python dependencies..."
    cd /workspace/backend
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        echo "⚠️  requirements.txt not found, skipping Python dependencies"
    fi
else
    echo "⚠️  Backend directory not found"
fi

# Check if frontend directory exists
if [ -d "/workspace/frontend" ]; then
    echo "📦 Installing Node.js dependencies..."
    cd /workspace/frontend
    if [ -f "package.json" ]; then
        npm install
    else
        echo "⚠️  package.json not found, skipping Node.js dependencies"
    fi
else
    echo "⚠️  Frontend directory not found"
fi

# Try to initialize database if backend exists
if [ -d "/workspace/backend" ]; then
    echo "🗄️  Initializing database..."
    cd /workspace/backend
    if [ -f "main.py" ]; then
        python -c "from app.database import init_db; init_db()" 2>/dev/null || echo "⚠️  Database initialization failed (this is normal on first run)"
    fi
fi

echo "✅ Development environment setup complete!"
echo "🎯 Backend will be available at http://localhost:8000"
echo "🎯 Frontend will be available at http://localhost:4200"
echo "📚 API documentation at http://localhost:8000/docs"
echo ""
echo "💡 To start the backend: cd backend && python start.py"
echo "💡 To start the frontend: cd frontend && npm start"
