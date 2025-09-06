#!/bin/bash

# Development startup script for Origen
echo "🚀 Starting Origen development environment..."

# Check if .env exists
if [ ! -f apps/server/.env ]; then
    echo "❌ apps/server/.env not found. Please run setup script first."
    exit 1
fi

# Start all development servers concurrently
echo "Starting development servers..."

# Function to kill all background processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start API server
echo "📡 Starting API server on port 3001..."
cd apps/server && yarn dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Start web app
echo "🌐 Starting web app on port 3000..."
cd ../web && yarn dev &
WEB_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "🌐 Web app: http://localhost:3000"
echo "📡 API server: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for all background processes
wait
