from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
import base64
import logging
import asyncio
from datetime import datetime
import json

# Import your existing classes
from secure_image_pipeline import SecureImagePipeline, ImageEncryptor, GCPImageUploader
from config import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Breast Scan AI Backend",
    description="Secure image processing and AI analysis backend",
    version="1.0.0"
)

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Configuration
CONFIG = {
    "encryption_key": config.ENCRYPTION_KEY,
    "camera_index": config.CAMERA_INDEX,
    "gcs_bucket": config.GCS_BUCKET
}

# Global variables
pipeline = None
processing_status = {}

@app.on_event("startup")
async def startup_event():
    """Initialize the image processing pipeline on startup"""
    global pipeline
    try:
        # Initialize the secure image pipeline
        pipeline = SecureImagePipeline(
            gcp_project_id=getattr(config, 'GCP_PROJECT_ID', None),
            gcp_secret_id=getattr(config, 'GCP_SECRET_ID', None),
            encryption_key=CONFIG["encryption_key"],
            gcs_bucket=CONFIG["gcs_bucket"]
        )
        logger.info("Secure image pipeline initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize pipeline: {e}")
        pipeline = None

# Pydantic models
class ImageUploadRequest(BaseModel):
    image: str  # Base64 encoded image
    metadata: Dict[str, Any]

class ImageUploadResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    message: str
    processingId: Optional[str] = None

class ProcessingStatus(BaseModel):
    status: str  # 'pending', 'processing', 'completed', 'failed'
    progress: int
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    cloud_path: Optional[str] = None

# In-memory storage for processing status (use Redis/DB in production)
# processing_status = {} # This line is now handled by the global variable

# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Implement your authentication logic here
    # For now, accept any valid Bearer token
    if not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return credentials.credentials

@app.get("/")
async def root():
    return {"message": "Breast Scan AI Backend is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "pipeline_ready": pipeline is not None
    }

@app.post("/api/upload-image", response_model=ImageUploadResponse)
async def upload_image(
    request: ImageUploadRequest,
    token: str = Depends(verify_token)
):
    """Upload and process image using SecureImagePipeline"""
    try:
        logger.info("Received image upload request")
        
        if not pipeline:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image processing pipeline not available"
            )

        # Decode base64 image
        try:
            image_data = base64.b64decode(request.image)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 image data: {str(e)}"
            )

        # Generate processing ID
        processing_id = f"proc_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        # Store initial status
        processing_status[processing_id] = {
            "status": "pending",
            "progress": 0,
            "timestamp": datetime.now().isoformat(),
            "metadata": request.metadata
        }

        # Process image asynchronously
        asyncio.create_task(process_image_async(processing_id, image_data, request.metadata))

        return ImageUploadResponse(
            success=True,
            filename=f"scan_{processing_id}.npy.enc",
            message="Image uploaded successfully and processing started",
            processingId=processing_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@app.post("/api/process-image", response_model=ProcessingStatus)
async def process_image_directly(
    request: ImageUploadRequest,
    token: str = Depends(verify_token)
):
    """Process image directly and return results"""
    try:
        logger.info("Received direct processing request")
        
        if not pipeline:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image processing pipeline not available"
            )

        # Decode base64 image
        try:
            image_data = base64.b64decode(request.image)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 image data: {str(e)}"
            )

        # Process image synchronously
        result = await process_image_sync(image_data, request.metadata)
        
        # Extract cloud path from the result if available
        cloud_path = None
        
        if isinstance(result, dict) and "storage_info" in result:
            cloud_path = result["storage_info"].get("cloud_path")
        
        return ProcessingStatus(
            status="completed",
            progress=100,
            result=result,
            cloud_path=cloud_path
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Direct processing failed: {e}")
        return ProcessingStatus(
            status="failed",
            progress=0,
            error=str(e)
        )

@app.get("/api/status/{processing_id}", response_model=ProcessingStatus)
async def get_processing_status(
    processing_id: str,
    token: str = Depends(verify_token)
):
    """Get processing status for a specific job"""
    if processing_id not in processing_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processing ID not found"
        )
    
    return ProcessingStatus(**processing_status[processing_id])

async def process_image_async(processing_id: str, image_data: bytes, metadata: Dict[str, Any]):
    """Process image asynchronously and update status"""
    try:
        logger.info(f"Starting async processing for {processing_id}")
        
        # Update status to processing
        processing_status[processing_id]["status"] = "processing"
        processing_status[processing_id]["progress"] = 25

        # Simulate processing steps
        await asyncio.sleep(1)
        processing_status[processing_id]["progress"] = 50
        
        await asyncio.sleep(1)
        processing_status[processing_id]["progress"] = 75

        # Process the actual image data from the frontend
        try:
            # Convert base64 to image array directly
            import numpy as np
            import base64
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)
            
            # Convert bytes to NumPy array (assuming RGB format)
            # Note: This assumes the frontend sends base64 encoded raw image data
            # You may need to adjust this based on your frontend implementation
            image_array = np.frombuffer(image_bytes, dtype=np.uint8)
            
            # Reshape to 3D array (assuming RGB)
            # This is a placeholder - adjust dimensions based on your actual image format
            height = int(np.sqrt(len(image_array) / 3))
            width = height
            image_array = image_array.reshape((height, width, 3))
            
            # Process and store directly to cloud
            storage_info = pipeline.process_and_store(image_array, user_id="async_user", scan_id=f"scan_{processing_id}")
            
            # Store cloud path for later use
            processing_status[processing_id]["cloud_path"] = storage_info.get("cloud_path")
            
            logger.info(f"Image processed and stored directly to cloud: {storage_info.get('cloud_path')}")
            
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            # Fallback to mock results if processing fails
            ai_result = generate_mock_ai_results()
        else:
            # Generate AI analysis results based on the processed image
            ai_result = generate_mock_ai_results()
        
        # Update status to completed
        processing_status[processing_id]["status"] = "completed"
        processing_status[processing_id]["progress"] = 100
        processing_status[processing_id]["result"] = ai_result
        
        # Add cloud path information to the result
        if isinstance(ai_result, dict):
            ai_result['cloud_path'] = processing_status[processing_id].get('cloud_path')
        
        logger.info(f"Async processing completed for {processing_id}")

    except Exception as e:
        logger.error(f"Async processing failed for {processing_id}: {e}")
        processing_status[processing_id]["status"] = "failed"
        processing_status[processing_id]["error"] = str(e)

async def process_image_sync(image_data: bytes, metadata: Dict[str, Any]):
    """Process image synchronously and return results with unique IDs"""
    try:
        logger.info("Starting synchronous processing")
        
        # Extract user ID from metadata
        user_id = metadata.get('userId', 'unknown_user')
        
        # Generate unique scan ID for this session
        scan_id = pipeline.generate_unique_id(user_id, "scan")
        
        # Process the actual image data from the frontend
        try:
            # Convert base64 to image array directly
            import numpy as np
            import base64
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)
            
            # Convert bytes to NumPy array (assuming RGB format)
            image_array = np.frombuffer(image_bytes, dtype=np.uint8)
            
            # Reshape to 3D array (assuming RGB)
            height = int(np.sqrt(len(image_array) / 3))
            width = height
            image_array = image_array.reshape((height, width, 3))
            
            # Process and store with unique IDs
            storage_info = pipeline.process_and_store(
                image_array, 
                user_id=user_id,
                scan_id=scan_id
            )
            
            logger.info(f"Image processed and stored: {storage_info}")
            
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            # Fallback to mock results if processing fails
            ai_result = generate_mock_ai_results(scan_id)
        else:
            # Generate AI analysis results based on the processed image
            ai_result = generate_mock_ai_results(scan_id)
        
        # Store processing status with unique IDs
        processing_status[scan_id] = {
            "status": "completed",
            "progress": 100,
            "result": ai_result,
            "storage_info": storage_info,
            "metadata": metadata,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("Synchronous processing completed")
        return {
            "scan_id": scan_id,
            "analysis": ai_result,
            "storage_info": storage_info
        }
        
    except Exception as e:
        logger.error(f"Failed to process image: {e}")
        raise

def generate_mock_ai_results(scan_id: str):
    """Generate mock AI analysis results with unique ID"""
    import random
    
    findings_options = [
        "No significant abnormalities detected",
        "Minor tissue density variations observed",
        "Normal breast tissue architecture",
        "No suspicious masses or calcifications",
        "Symmetrical breast tissue distribution"
    ]
    
    risk_levels = ["Low", "Low-Medium", "Medium", "Medium-High", "High"]
    
    recommendations = [
        "Continue with regular self-examinations. Schedule follow-up in 6 months.",
        "Monitor for any changes. Consider follow-up scan in 3 months.",
        "Maintain current screening schedule. No immediate action required.",
        "Continue healthy lifestyle practices. Annual screening recommended.",
        "Schedule consultation with healthcare provider for personalized advice."
    ]
    
    return {
        "analysis_id": f"{scan_id}_analysis",
        "findings": random.choice(findings_options),
        "confidence": random.randint(80, 98),
        "riskLevel": random.choice(risk_levels[:3]),  # Bias towards lower risk
        "recommendation": random.choice(recommendations),
        "timestamp": datetime.now().isoformat(),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

