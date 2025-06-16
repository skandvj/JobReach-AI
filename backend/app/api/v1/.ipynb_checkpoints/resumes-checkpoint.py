# backend/app/api/v1/resumes.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from datetime import datetime
import os
import shutil

router = APIRouter()
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(resume: UploadFile = File(...), clerk_user_id: str = Query(...)):
    try:
        filename = f"{clerk_user_id}_{datetime.utcnow().timestamp()}_{resume.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        return {
            "id": 1,  # Replace with real DB ID if needed
            "fileName": resume.filename,
            "filePath": file_path,
            "fileSize": os.path.getsize(file_path),
            "createdAt": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/")
async def list_resumes(clerk_user_id: str = Query(...)):
    try:
        files = os.listdir(UPLOAD_DIR)
        user_files = [f for f in files if f.startswith(clerk_user_id)]
        return {
            "resumes": [
                {
                    "id": idx + 1,
                    "fileName": f.split("_", 2)[-1],
                    "filePath": os.path.join(UPLOAD_DIR, f),
                    "fileSize": os.path.getsize(os.path.join(UPLOAD_DIR, f)),
                    "createdAt": datetime.utcfromtimestamp(
                        float(f.split("_")[1])
                    ).isoformat()
                }
                for idx, f in enumerate(user_files)
            ]
        }
    except FileNotFoundError:
        return {"resumes": []}
