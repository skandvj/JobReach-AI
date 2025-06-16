from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import aiofiles
from typing import List
from pydantic import BaseModel
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="JobAssist AI",
    description="AI-powered career copilot API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
resumes_store = []
matches_store = []

class ResumeResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    created_at: str

class MatchRequest(BaseModel):
    job_description: str
    personal_story: str = ""

class ContactInfo(BaseModel):
    name: str
    role: str
    company: str
    linkedin_url: str = None
    email: str = None
    mutual_score: float

class MatchResponse(BaseModel):
    best_resume: dict
    gap_analysis: List[str]
    contacts: List[ContactInfo]
    email_draft: str
    match_id: int

@app.get("/")
async def root():
    return {"message": "JobAssist AI API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/v1/resumes/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    clerk_user_id: str = Form(...)
):
    """Upload and process a resume"""
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Create uploads directory
    upload_dir = "uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{file_id}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Store resume info
    resume_data = {
        "id": len(resumes_store) + 1,
        "file_name": file.filename,
        "file_path": file_path,
        "clerk_user_id": clerk_user_id,
        "created_at": "2024-01-01T00:00:00Z"
    }
    resumes_store.append(resume_data)
    
    logger.info(f"Uploaded resume: {file.filename} for user: {clerk_user_id}")
    
    return ResumeResponse(
        id=resume_data["id"],
        file_name=file.filename,
        file_path=file_path,
        created_at=resume_data["created_at"]
    )

@app.get("/api/v1/resumes/")
async def get_user_resumes(clerk_user_id: str):
    """Get all resumes for a user"""
    user_resumes = [r for r in resumes_store if r["clerk_user_id"] == clerk_user_id]
    return user_resumes

@app.post("/api/v1/match/", response_model=MatchResponse)
async def find_match(
    request: MatchRequest,
    clerk_user_id: str
):
    """Find best resume match and generate insights"""
    
    # Get user resumes
    user_resumes = [r for r in resumes_store if r["clerk_user_id"] == clerk_user_id]
    
    if not user_resumes:
        raise HTTPException(status_code=400, detail="No resumes uploaded")
    
    # Mock best resume selection (use first one for demo)
    best_resume = user_resumes[0]
    
    # Mock gap analysis
    gap_analysis = [
        "Add specific metrics and quantifiable achievements to your experience",
        "Include relevant keywords from the job description in your skills section",
        "Highlight experience with technologies mentioned in the job posting",
        "Emphasize leadership and collaboration skills for team-oriented roles",
        "Add relevant certifications or training that match job requirements",
        "Quantify your impact with numbers, percentages, or dollar amounts",
        "Tailor your summary to directly address the company's needs"
    ]
    
    # Mock contacts
    contacts = [
        ContactInfo(
            name="Sarah Johnson",
            role="Senior Software Engineer",
            company="TechCorp",
            linkedin_url="https://linkedin.com/in/sarah-johnson",
            mutual_score=0.8
        ),
        ContactInfo(
            name="Mike Chen",
            role="Engineering Manager",
            company="TechCorp",
            linkedin_url="https://linkedin.com/in/mike-chen",
            mutual_score=0.7
        ),
        ContactInfo(
            name="Emily Rodriguez",
            role="Technical Recruiter",
            company="TechCorp",
            linkedin_url="https://linkedin.com/in/emily-rodriguez",
            mutual_score=0.9
        )
    ]
    
    # Mock email draft
    email_draft = f"""Subject: Application for Software Engineer Position - Excited to Contribute

Dear Hiring Manager,

I hope this message finds you well. I'm writing to express my strong interest in the Software Engineer position at your company.

Based on the job description you've shared, I believe my background aligns well with your requirements. I'm particularly excited about the opportunity to work with your team and contribute to innovative projects.

Key highlights from my background:
- Experience with the technologies mentioned in your job posting
- Strong problem-solving and analytical skills
- Proven track record of delivering high-quality software solutions

{request.personal_story if request.personal_story else "I'm passionate about creating technology that makes a meaningful impact."}

I'd love to discuss how my skills and enthusiasm can benefit your organization. Would you be available for a brief conversation this week?

Thank you for your consideration. I look forward to hearing from you.

Best regards,
[Your Name]"""
    
    # Store match
    match_id = len(matches_store) + 1
    match_data = {
        "id": match_id,
        "user_id": clerk_user_id,
        "job_description": request.job_description,
        "best_resume": best_resume,
        "gap_analysis": gap_analysis,
        "contacts": contacts,
        "email_draft": email_draft
    }
    matches_store.append(match_data)
    
    logger.info(f"Created job match {match_id} for user {clerk_user_id}")
    
    return MatchResponse(
        best_resume={
            "id": best_resume["id"],
            "file_name": best_resume["file_name"],
            "file_path": best_resume["file_path"],
            "content": "Resume content would be extracted here",
            "score": 0.85
        },
        gap_analysis=gap_analysis,
        contacts=contacts,
        email_draft=email_draft,
        match_id=match_id
    )

@app.get("/api/v1/contacts/{match_id}")
async def get_contacts(match_id: int, clerk_user_id: str):
    """Get contacts for a job match"""
    
    # Find the match
    match = next((m for m in matches_store if m["id"] == match_id and m["user_id"] == clerk_user_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Job match not found")
    
    return match["contacts"]

@app.post("/api/v1/match/{match_id}/feedback")
async def submit_feedback(
    match_id: int,
    feedback: dict,
    clerk_user_id: str
):
    """Submit feedback for a job match"""
    
    logger.info(f"Received feedback for match {match_id}: {feedback}")
    return {"message": "Feedback submitted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
