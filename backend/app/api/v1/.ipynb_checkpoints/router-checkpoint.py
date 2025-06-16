# backend/app/api/v1/router.py

from fastapi import APIRouter
from . import resumes

api_router = APIRouter()
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
