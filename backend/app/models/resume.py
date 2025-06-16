from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    content_text = Column(Text)
    embedding_id = Column(String(36), index=True)  # UUID
    processed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    job_matches = relationship("JobMatch", back_populates="resume")
    
    # Add composite index for better query performance
    __table_args__ = (
        Index('idx_resume_user_created', 'user_id', 'created_at'),
    )

class JobMatch(Base):
    __tablename__ = "job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_description = Column(Text, nullable=False)
    job_title = Column(String(255))
    company_name = Column(String(255))
    match_score = Column(Float, index=True)
    gap_analysis = Column(Text)  # JSON string
    contacts = Column(Text)  # JSON string
    email_draft = Column(Text)
    feedback_score = Column(Integer)  # 1 for thumbs up, -1 for thumbs down
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="job_matches")
    resume = relationship("Resume", back_populates="job_matches")
    
    # Add composite indexes
    __table_args__ = (
        Index('idx_job_match_user_created', 'user_id', 'created_at'),
        Index('idx_job_match_score', 'match_score'),
    )
