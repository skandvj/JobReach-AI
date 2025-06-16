#!/bin/bash

echo "🎯 Completing JobAssist AI Setup with Full Functionality..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the jobassist-ai root directory"
    exit 1
fi

# Install any missing dependencies
echo "📦 Installing additional frontend dependencies..."
cd frontend
npm install react-dropzone @radix-ui/react-slot
cd ..

# Create uploads directory
mkdir -p backend/uploads/resumes

# Set proper permissions
chmod 755 backend/uploads
chmod 755 backend/uploads/resumes

# Check if services are running
echo "🔍 Checking if required services are running..."

# Check PostgreSQL
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  Starting PostgreSQL..."
    docker-compose up -d postgres
fi

# Check Weaviate
if docker-compose ps weaviate | grep -q "Up"; then
    echo "✅ Weaviate is running"
else
    echo "⚠️  Starting Weaviate..."
    docker-compose up -d weaviate
fi

# Check Redis
if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis is running"
else
    echo "⚠️  Starting Redis..."
    docker-compose up -d redis
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be fully ready..."
sleep 10

# Test database connection and create tables
echo "🗄️  Setting up database..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    python -c "
try:
    from app.core.database import engine, Base
    from app.models.user import User
    from app.models.resume import Resume, JobMatch
    Base.metadata.create_all(bind=engine)
    print('✅ Database tables created successfully!')
except Exception as e:
    print(f'❌ Database setup failed: {e}')
    print('Please check your DATABASE_URL in .env file')
"
else
    echo "⚠️  Virtual environment not found. Please run the main setup script first."
fi
cd ..

echo ""
echo "🎉 Setup Complete! Your JobAssist AI is ready for full functionality."
echo ""
echo "🚀 To start your application:"
echo ""
echo "1. Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "✨ Features now available:"
echo "   • User authentication via Clerk"
echo "   • Resume upload with drag & drop"
echo "   • AI-powered job matching"
echo "   • Gap analysis and suggestions"
echo "   • Contact discovery"
echo "   • Email generation"
echo "   • Feedback system"
echo ""
echo "🔧 Make sure to configure your .env file with API keys for full functionality!"
