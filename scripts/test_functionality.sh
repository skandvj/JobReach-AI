#!/bin/bash

echo "🧪 Testing JobAssist AI Functionality..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if service is running
check_service() {
    local service_name=$1
    local port=$2
    
    if curl -s http://localhost:$port > /dev/null; then
        echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not responding on port $port${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000$endpoint)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ ($response)${NC}"
        return 0
    else
        echo -e "${RED}❌ Expected $expected_status, got $response${NC}"
        return 1
    fi
}

echo -e "${BLUE}🔍 Checking Service Status...${NC}"

# Check if Docker services are running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Starting Docker services...${NC}"
    docker-compose up -d
    sleep 10
fi

# Check individual services
check_service "PostgreSQL" 5432
check_service "Weaviate" 8080 
check_service "Redis" 6379

echo ""
echo -e "${BLUE}🌐 Testing API Endpoints...${NC}"

# Test backend health
test_endpoint "/health" "200" "Backend Health Check"
test_endpoint "/docs" "200" "API Documentation"
test_endpoint "/metrics" "200" "Metrics Endpoint"

# Test API routes (these might return 422 without auth, which is expected)
test_endpoint "/api/v1/resumes/" "422" "Resume List Endpoint"
test_endpoint "/api/v1/match/" "422" "Match Endpoint"

echo ""
echo -e "${BLUE}🧠 Testing AI Services...${NC}"

# Test if AI service can be initialized
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    python -c "
import asyncio
from app.services.ml_service import MLService
from app.services.vector_service import VectorService

async def test_services():
    print('Testing ML Service...')
    ml_service = MLService()
    await ml_service.initialize()
    if ml_service.initialized:
        print('✅ ML Service initialized successfully')
    else:
        print('⚠️  ML Service failed to initialize (check API keys)')
    
    print('Testing Vector Service...')
    vector_service = VectorService()
    await vector_service.initialize()
    if vector_service.initialized:
        print('✅ Vector Service initialized successfully')
    else:
        print('⚠️  Vector Service failed to initialize')

asyncio.run(test_services())
"
fi
cd ..

echo ""
echo -e "${BLUE}📁 Testing File System...${NC}"

# Check if upload directories exist and are writable
if [ -d "backend/uploads/resumes" ] && [ -w "backend/uploads/resumes" ]; then
    echo -e "${GREEN}✅ Upload directory is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Creating upload directory...${NC}"
    mkdir -p backend/uploads/resumes
    chmod 755 backend/uploads/resumes
fi

echo ""
echo -e "${BLUE}🔧 Environment Configuration Check...${NC}"

# Check if .env file exists and has required keys
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check for required keys
    required_keys=("CLERK_SECRET_KEY" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "DATABASE_URL")
    for key in "${required_keys[@]}"; do
        if grep -q "^$key=" .env && ! grep -q "^$key=your_" .env; then
            echo -e "${GREEN}✅ $key is configured${NC}"
        else
            echo -e "${YELLOW}⚠️  $key needs configuration${NC}"
        fi
    done
    
    # Check for optional keys
    optional_keys=("OPENAI_API_KEY" "SERPAPI_KEY" "SENDGRID_API_KEY")
    for key in "${optional_keys[@]}"; do
        if grep -q "^$key=" .env && ! grep -q "^$key=your_" .env; then
            echo -e "${GREEN}✅ $key is configured (enables advanced features)${NC}"
        else
            echo -e "${BLUE}ℹ️  $key not configured (some features will use fallbacks)${NC}"
        fi
    done
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please copy .env.example to .env and configure your API keys"
fi

echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=================================="

# Check frontend build
cd frontend
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    
    # Test build
    echo -n "Testing frontend build... "
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Build has warnings (check npm run build)${NC}"
    fi
else
    echo -e "${RED}❌ Frontend dependencies not installed${NC}"
    echo "Run: cd frontend && npm install"
fi
cd ..

echo ""
echo -e "${GREEN}🎉 Functionality Test Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Fix any ❌ or ⚠️  issues above"
echo "2. Configure missing API keys in .env file"
echo "3. Start your development servers:"
echo "   Backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   Frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000 to test the full application"
echo ""
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo "• Test with real job descriptions for best results"
echo "• Upload multiple resume variants to test matching"
echo "• Use the feedback system to improve AI accuracy"
echo "• Check the API docs at http://localhost:8000/docs"
