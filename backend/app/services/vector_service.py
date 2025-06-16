import weaviate
from sentence_transformers import SentenceTransformer
import uuid
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings
import time

logger = logging.getLogger(__name__)

class VectorService:
    """Enhanced vector database service with better matching algorithms"""
    
    def __init__(self):
        self.client = None
        self.encoder = None
        self.class_name = "Resume"
        self.initialized = False
    
    async def initialize(self):
        """Initialize Weaviate client and sentence transformer with retry logic"""
        max_retries = 3
        retry_delay = 5
        
        for attempt in range(max_retries):
            try:
                # Initialize Weaviate client
                self.client = weaviate.Client(
                    url=settings.VECTOR_DB_URL,
                    timeout_config=(5, 30)
                )
                
                # Test connection
                if self.client.is_ready():
                    logger.info("Weaviate connection established")
                else:
                    raise Exception("Weaviate not ready")
                
                # Initialize sentence transformer
                self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("Sentence transformer loaded")
                
                # Create schema if needed
                await self._create_schema()
                
                self.initialized = True
                logger.info("Vector service initialized successfully")
                return
                
            except Exception as e:
                logger.error(f"Vector service initialization attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    logger.error("Failed to initialize vector service after all retries")
                    self.initialized = False
                    # Don't raise here - allow system to work without vector search
    
    async def _create_schema(self):
        """Create Weaviate schema for resumes with enhanced properties"""
        schema = {
            "class": self.class_name,
            "description": "Resume documents with semantic embeddings",
            "vectorIndexType": "hnsw",
            "vectorIndexConfig": {
                "distance": "cosine",
                "efConstruction": 128,
                "maxConnections": 64
            },
            "properties": [
                {
                    "name": "content",
                    "dataType": ["text"],
                    "description": "Full resume text content",
                    "indexSearchable": True
                },
                {
                    "name": "userId",
                    "dataType": ["int"],
                    "description": "User ID who owns this resume"
                },
                {
                    "name": "fileName",
                    "dataType": ["string"],
                    "description": "Original filename"
                },
                {
                    "name": "filePath",
                    "dataType": ["string"],
                    "description": "File storage path"
                },
                {
                    "name": "keywords",
                    "dataType": ["string[]"],
                    "description": "Extracted keywords and skills"
                },
                {
                    "name": "createdAt",
                    "dataType": ["date"],
                    "description": "Creation timestamp"
                }
            ],
            "vectorizer": "none"
        }
        
        try:
            existing_schema = self.client.schema.get()
            class_exists = any(cls["class"] == self.class_name for cls in existing_schema.get("classes", []))
            
            if not class_exists:
                self.client.schema.create_class(schema)
                logger.info(f"Created Weaviate schema for class {self.class_name}")
            else:
                logger.info(f"Schema for class {self.class_name} already exists")
                
        except Exception as e:
            logger.error(f"Error creating/checking schema: {str(e)}")
    
    async def store_resume(self, content: str, metadata: Dict[str, Any]) -> str:
        """Store resume with enhanced metadata and error handling"""
        if not self.initialized:
            logger.warning("Vector service not initialized, skipping vector storage")
            return str(uuid.uuid4())  # Return a fake ID for now
        
        try:
            # Extract keywords for better searchability
            keywords = self._extract_keywords(content)
            
            # Generate embedding
            embedding = self.encoder.encode(content).tolist()
            
            # Create unique ID
            resume_id = str(uuid.uuid4())
            
            # Prepare data object with enhanced metadata
            data_object = {
                "content": content,
                "userId": metadata["user_id"],
                "fileName": metadata["file_name"],
                "filePath": metadata["file_path"],
                "keywords": keywords,
                "createdAt": "2024-01-01T00:00:00Z"
            }
            
            # Store in Weaviate
            self.client.data_object.create(
                data_object=data_object,
                class_name=self.class_name,
                uuid=resume_id,
                vector=embedding
            )
            
            logger.info(f"Successfully stored resume with ID: {resume_id}")
            return resume_id
            
        except Exception as e:
            logger.error(f"Error storing resume: {str(e)}")
            # Return a fallback ID so the system doesn't crash
            return str(uuid.uuid4())
    
    async def search_resumes(self, job_description: str, user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Enhanced resume search with multiple strategies"""
        if not self.initialized:
            logger.warning("Vector service not initialized, returning empty results")
            return []
        
        try:
            # Generate embedding for job description
            query_embedding = self.encoder.encode(job_description).tolist()
            
            # Perform hybrid search (vector + keyword)
            vector_results = await self._vector_search(query_embedding, user_id, limit)
            
            # Add keyword-based scoring boost
            enhanced_results = self._enhance_with_keyword_matching(vector_results, job_description)
            
            # Sort by combined score
            enhanced_results.sort(key=lambda x: x["score"], reverse=True)
            
            return enhanced_results[:limit]
            
        except Exception as e:
            logger.error(f"Error searching resumes: {str(e)}")
            return []
    
    async def _vector_search(self, query_embedding: List[float], user_id: int, limit: int) -> List[Dict[str, Any]]:
        """Perform vector similarity search"""
        try:
            result = (
                self.client.query
                .get(self.class_name, ["content", "userId", "fileName", "filePath", "keywords"])
                .with_near_vector({"vector": query_embedding})
                .with_where({
                    "path": ["userId"],
                    "operator": "Equal",
                    "valueInt": user_id
                })
                .with_additional(["distance", "id"])
                .with_limit(limit * 2)  # Get more results for reranking
                .do()
            )
            
            resumes = []
            if result.get("data", {}).get("Get", {}).get(self.class_name):
                for item in result["data"]["Get"][self.class_name]:
                    resumes.append({
                        "id": item["_additional"]["id"],
                        "content": item["content"],
                        "file_name": item["fileName"],
                        "file_path": item["filePath"],
                        "keywords": item.get("keywords", []),
                        "distance": item["_additional"]["distance"],
                        "score": 1 - item["_additional"]["distance"]
                    })
            
            return resumes
            
        except Exception as e:
            logger.error(f"Vector search error: {str(e)}")
            return []
    
    def _enhance_with_keyword_matching(self, results: List[Dict], job_description: str) -> List[Dict]:
        """Enhance vector search results with keyword matching"""
        job_keywords = set(self._extract_keywords(job_description))
        
        for result in results:
            resume_keywords = set(result.get("keywords", []))
            
            # Calculate keyword overlap score
            if job_keywords and resume_keywords:
                overlap = len(job_keywords.intersection(resume_keywords))
                keyword_score = overlap / len(job_keywords)
            else:
                keyword_score = 0
            
            # Combine vector and keyword scores (weighted average)
            vector_score = result["score"]
            combined_score = (0.7 * vector_score) + (0.3 * keyword_score)
            
            result["score"] = combined_score
            result["keyword_matches"] = list(job_keywords.intersection(resume_keywords))
        
        return results
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        import re
        
        # Technical skills patterns
        tech_patterns = [
            r'\b(?:Python|JavaScript|TypeScript|React|Vue|Angular|Node\.js|Java|C\+\+|C#|Go|Rust|PHP|Ruby)\b',
            r'\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|GitHub)\b',
            r'\b(?:HTML|CSS|SASS|Bootstrap|Tailwind)\b',
            r'\b(?:REST|GraphQL|API|microservices|serverless)\b',
            r'\b(?:machine learning|ML|AI|data science|analytics)\b',
            r'\b(?:agile|scrum|DevOps|CI/CD|TDD|testing)\b'
        ]
        
        # Soft skills patterns
        soft_patterns = [
            r'\b(?:leadership|management|communication|collaboration)\b',
            r'\b(?:problem[- ]solving|analytical|creative|innovative)\b',
            r'\b(?:project management|team lead|mentoring)\b'
        ]
        
        keywords = []
        text_lower = text.lower()
        
        all_patterns = tech_patterns + soft_patterns
        for pattern in all_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            keywords.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_keywords = []
        for keyword in keywords:
            if keyword.lower() not in seen:
                seen.add(keyword.lower())
                unique_keywords.append(keyword)
        
        return unique_keywords[:20]  # Limit to top 20 keywords
    
    async def delete_resume(self, resume_id: str):
        """Delete resume from vector database"""
        if not self.initialized:
            logger.warning("Vector service not initialized, skipping deletion")
            return
        
        try:
            self.client.data_object.delete(
                uuid=resume_id,
                class_name=self.class_name
            )
            logger.info(f"Deleted resume with ID: {resume_id}")
        except Exception as e:
            logger.error(f"Error deleting resume: {str(e)}")
    
    async def close(self):
        """Close connections and cleanup"""
        self.initialized = False
        # Weaviate client doesn't need explicit closing
        logger.info("Vector service closed")
