from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import settings with fallback
try:
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import settings, using defaults")
    class DefaultSettings:
        ALLOWED_HOSTS = ["*"]
        ENVIRONMENT = "development"
    settings = DefaultSettings()

# Import database with fallback
try:
    from app.core.database import engine, Base
    DATABASE_AVAILABLE = True
except ImportError:
    logger.warning("Database not available")
    DATABASE_AVAILABLE = False

# Import API router with fallback
try:
    from app.api.v1.router import api_router
    API_ROUTER_AVAILABLE = True
except ImportError:
    logger.warning("API router not available")
    API_ROUTER_AVAILABLE = False

# Import services with fallback
try:
    from app.services.vector_service import VectorService
    from app.services.ml_service import MLService
    SERVICES_AVAILABLE = True
except ImportError:
    logger.warning("Services not available")
    SERVICES_AVAILABLE = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting JobAssist AI...")
    
    if DATABASE_AVAILABLE:
        try:
            from app.models.user import User
            from app.models.resume import Resume, JobMatch
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created/verified")
        except Exception as e:
            logger.error(f"Database setup failed: {e}")
    
    if SERVICES_AVAILABLE:
        try:
            vector_service = VectorService()
            ml_service = MLService()
            await vector_service.initialize()
            await ml_service.initialize()
            app.state.vector_service = vector_service
            app.state.ml_service = ml_service
            logger.info("Services initialized")
        except Exception as e:
            logger.error(f"Service initialization failed: {e}")
    
    yield

    logger.info("Shutting down JobAssist AI...")
    if SERVICES_AVAILABLE and hasattr(app.state, 'vector_service'):
        try:
            await app.state.vector_service.close()
        except Exception as e:
            logger.error(f"Error closing vector service: {e}")

# ✅ Create FastAPI app
app = FastAPI(
    title="JobAssist AI",
    description="AI-powered career copilot API",
    version="1.0.0",
    lifespan=lifespan
)

# ✅ Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=getattr(settings, 'ALLOWED_HOSTS', ["*"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Setup monitoring if available
try:
    from app.core.monitoring import setup_monitoring
    setup_monitoring(app)
except ImportError:
    logger.warning("Monitoring not available")

# ✅ Only now: include the router
if API_ROUTER_AVAILABLE:
    app.include_router(api_router, prefix="/api/v1")

# ✅ Health endpoints
@app.get("/")
async def root():
    return {
        "message": "JobAssist AI API", 
        "version": "1.0.0",
        "status": "running",
        "components": {
            "database": DATABASE_AVAILABLE,
            "services": SERVICES_AVAILABLE,
            "api_router": API_ROUTER_AVAILABLE
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": "1.0.0",
        "database": DATABASE_AVAILABLE,
        "services": SERVICES_AVAILABLE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
