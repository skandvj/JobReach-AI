# backend/app/api/resumes.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import os
import shutil

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(resume: UploadFile = File(...), clerk_user_id: str = Query(...)):
    file_path = os.path.join(UPLOAD_DIR, f"{clerk_user_id}_{resume.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        return {"message": "Upload successful", "file": resume.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_resumes(clerk_user_id: str = Query(...)):
    try:
        files = os.listdir(UPLOAD_DIR)
        user_files = [f for f in files if f.startswith(clerk_user_id)]
        return {"resumes": user_files}
    except FileNotFoundError:
        return {"resumes": []}
