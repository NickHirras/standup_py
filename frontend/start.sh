#!/bin/bash

echo "🚀 Starting StandUp Frontend Development Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting Angular development server..."
ng serve --host 0.0.0.0 --port 4200
