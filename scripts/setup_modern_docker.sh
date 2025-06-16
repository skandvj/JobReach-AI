#!/bin/bash

echo "🚀 Setting up JobAssist AI (Modern Docker)..."

# Use full Docker paths for modern Docker
DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"

# Check if Docker is running
if ! $DOCKER_CMD --version &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running (version: $($DOCKER_CMD --version))"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your API keys and configuration."
fi

# Create uploads directory
mkdir -p backend/uploads/resumes

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "🐍 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Start services with modern Docker Compose
echo "🐳 Starting services with Docker Compose..."
$DOCKER_CMD compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update your .env file with real API keys"
echo "2. Start the backend server:"
echo "   cd backend && source venv/bin/activate && python main.py"
echo ""
echo "3. Start the frontend server (new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Visit http://localhost:3000 to see your app!"
echo ""
echo "📚 API Documentation will be available at http://localhost:8000/docs"
