import openai
import logging
from typing import List, Dict, Any
from app.core.config import settings
import json
import asyncio
import httpx

logger = logging.getLogger(__name__)

class MLService:
    """Enhanced ML service with better error handling and fallbacks"""
    
    def __init__(self):
        self.openai_client = None
        self.huggingface_client = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize AI clients with fallbacks"""
        try:
            if settings.OPENAI_API_KEY:
                openai.api_key = settings.OPENAI_API_KEY
                self.openai_client = openai
                logger.info("ML service initialized with OpenAI")
            
            if settings.HUGGINGFACE_API_KEY:
                self.huggingface_client = httpx.AsyncClient(
                    headers={"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"},
                    timeout=30.0
                )
                logger.info("ML service initialized with HuggingFace")
            
            self.initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize ML service: {str(e)}")
            self.initialized = False
    
    async def generate_gap_analysis(self, resume_content: str, job_description: str) -> List[str]:
        """Generate comprehensive gap analysis with enhanced suggestions"""
        try:
            # Extract key requirements from job description
            job_keywords = self._extract_keywords(job_description)
            resume_keywords = self._extract_keywords(resume_content)
            
            prompt = f"""
            Analyze this resume against the job description and provide specific, actionable improvement suggestions.
            
            Job Description:
            {job_description[:2000]}
            
            Resume Content:
            {resume_content[:2000]}
            
            Provide 6-8 specific suggestions focusing on:
            1. Missing technical skills or technologies
            2. Relevant experience that should be highlighted
            3. Keywords that should be added
            4. Quantifiable achievements that could be improved
            5. Industry-specific terminology to include
            6. Certifications or training that would help
            
            Format each suggestion as a clear, actionable bullet point.
            Be specific and avoid generic advice.
            """
            
            if self.openai_client:
                suggestions = await self._call_openai(prompt)
                # Parse and clean suggestions
                parsed_suggestions = self._parse_suggestions(suggestions)
                if parsed_suggestions:
                    return parsed_suggestions
            
            # Fallback to rule-based analysis
            return self._fallback_gap_analysis(resume_keywords, job_keywords)
                
        except Exception as e:
            logger.error(f"Error generating gap analysis: {str(e)}")
            return self._fallback_gap_analysis(set(), set())
    
    async def generate_email_draft(self, job_description: str, resume_content: str, personal_story: str = "") -> str:
        """Generate personalized outreach email with enhanced personalization"""
        try:
            # Extract company and role info
            company_info = self._extract_company_info(job_description)
            
            prompt = f"""
            Write a professional, personalized outreach email for this job application.
            
            Job Description:
            {job_description[:1500]}
            
            Candidate Background:
            {resume_content[:1000]}
            
            Personal Context: {personal_story}
            
            Requirements:
            - Keep under 200 words
            - Professional but warm and conversational tone
            - Include specific skills/experiences that match the role
            - Mention genuine interest in the company/role
            - Include clear call to action
            - Use [Hiring Manager] as placeholder for name
            - Include subject line
            
            Make it feel personal and authentic, not templated.
            """
            
            if self.openai_client:
                email = await self._call_openai(prompt)
                if email and len(email) > 50:
                    return email
            
            # Fallback template with dynamic content
            return self._fallback_email_template(company_info, job_description, personal_story)
                
        except Exception as e:
            logger.error(f"Error generating email draft: {str(e)}")
            return self._fallback_email_template({}, job_description, personal_story)
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API with retry logic"""
        try:
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert career coach and resume advisor."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.4
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def _extract_keywords(self, text: str) -> set:
        """Extract relevant keywords from text"""
        import re
        
        # Common tech keywords and skills
        tech_patterns = [
            r'\b(?:Python|JavaScript|React|Node\.js|Java|C\+\+|SQL|AWS|Docker|Kubernetes)\b',
            r'\b(?:machine learning|data science|frontend|backend|full[- ]?stack)\b',
            r'\b(?:API|REST|GraphQL|microservices|DevOps|CI/CD)\b',
            r'\b(?:agile|scrum|project management|leadership)\b',
        ]
        
        keywords = set()
        text_lower = text.lower()
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            keywords.update(matches)
        
        return keywords
    
    def _extract_company_info(self, job_description: str) -> Dict[str, str]:
        """Extract company and role information"""
        lines = job_description.split('\n')
        company_info = {}
        
        # Simple heuristics to extract company and role
        for line in lines[:10]:
            if any(word in line.lower() for word in ['company', 'we are', 'join our']):
                company_info['company_line'] = line.strip()
                break
        
        return company_info
    
    def _parse_suggestions(self, suggestions_text: str) -> List[str]:
        """Parse AI-generated suggestions into clean list"""
        lines = suggestions_text.split('\n')
        suggestions = []
        
        for line in lines:
            line = line.strip()
            # Remove numbering and bullet points
            line = re.sub(r'^[\d\.\-\•\*]+\s*', '', line)
            if line and len(line) > 10 and not line.startswith('#'):
                suggestions.append(line)
        
        return suggestions[:8]  # Limit to 8 suggestions
    
    def _fallback_gap_analysis(self, resume_keywords: set, job_keywords: set) -> List[str]:
        """Fallback gap analysis when AI is unavailable"""
        missing_keywords = job_keywords - resume_keywords
        
        suggestions = [
            "Add specific metrics and quantifiable achievements to demonstrate impact",
            "Include more industry-specific keywords from the job description",
            "Highlight relevant technical skills and technologies",
            "Emphasize leadership and collaboration experiences",
            "Add relevant certifications or professional development",
            "Include specific project examples that match the role requirements"
        ]
        
        if missing_keywords:
            suggestions.insert(0, f"Consider adding these relevant skills: {', '.join(list(missing_keywords)[:3])}")
        
        return suggestions[:6]
    
    def _fallback_email_template(self, company_info: Dict, job_description: str, personal_story: str) -> str:
        """Fallback email template when AI is unavailable"""
        role_match = re.search(r'(engineer|developer|manager|analyst|designer)', job_description.lower())
        role = role_match.group(1) if role_match else "position"
        
        personal_touch = f"\n\n{personal_story}\n" if personal_story else ""
        
        return f"""Subject: Application for {role.title()} Position - Excited to Contribute

Dear Hiring Manager,

I hope this email finds you well. I'm writing to express my strong interest in the {role} position at your company.

After reviewing the job description, I'm excited about the opportunity to contribute my skills and experience to your team. My background aligns well with your requirements, particularly in areas of technical development and problem-solving.{personal_touch}
I would love to discuss how my experience and enthusiasm can benefit your organization. Would you be available for a brief conversation this week to explore this opportunity further?

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
[Your Name]
[Your Phone Number]
[Your Email]"""

import re
