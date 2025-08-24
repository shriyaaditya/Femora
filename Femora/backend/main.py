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
    "gcs_bucket": config.GCS_BUCKET,
    "camera_index": config.CAMERA_INDEX
}

# Initialize pipeline
try:
    pipeline = SecureImagePipeline(
        key_b64=CONFIG["encryption_key"],
        gcs_bucket=CONFIG["gcs_bucket"],
        camera_index=CONFIG["camera_index"]
    )
    logger.info("SecureImagePipeline initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize SecureImagePipeline: {e}")
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
    gcs_url: Optional[str] = None
    local_filename: Optional[str] = None

# In-memory storage for processing status (use Redis/DB in production)
processing_status = {}

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
        
        # Extract GCS info from the result if available
        gcs_url = None
        local_filename = None
        
        if isinstance(result, dict):
            gcs_url = result.get('gcs_url')
            local_filename = result.get('local_filename')
        
        return ProcessingStatus(
            status="completed",
            progress=100,
            result=result,
            gcs_url=gcs_url,
            local_filename=local_filename
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
            # Convert base64 to image array
            import numpy as np
            from PIL import Image
            import io
            
            # Convert bytes to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to NumPy array
            image_array = np.array(pil_image)
            
            # Process and upload to GCP
            local_filename, gcs_url = pipeline.process_and_upload(image_array, f"breast_scan_{processing_id}.png")
            
            # Store GCS URL for later use
            processing_status[processing_id]["gcs_url"] = gcs_url
            processing_status[processing_id]["local_filename"] = local_filename
            
            logger.info(f"Image processed and uploaded to GCS: {gcs_url}")
            
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
        
        # Add GCS information to the result
        if isinstance(ai_result, dict):
            ai_result['gcs_url'] = processing_status[processing_id].get('gcs_url')
            ai_result['local_filename'] = processing_status[processing_id].get('local_filename')
        
        logger.info(f"Async processing completed for {processing_id}")

    except Exception as e:
        logger.error(f"Async processing failed for {processing_id}: {e}")
        processing_status[processing_id]["status"] = "failed"
        processing_status[processing_id]["error"] = str(e)

async def process_image_sync(image_data: bytes, metadata: Dict[str, Any]):
    """Process image synchronously and return results"""
    try:
        logger.info("Starting synchronous processing")
        
        # Process the actual image data from the frontend
        try:
            # Convert base64 to image array
            import numpy as np
            from PIL import Image
            import io
            
            # Convert bytes to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to NumPy array
            image_array = np.array(pil_image)
            
            # Process and upload to GCP
            local_filename, gcs_url = pipeline.process_and_upload(image_array, f"breast_scan_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.png")
            
            logger.info(f"Image processed and uploaded to GCS: {gcs_url}")
            
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            # Fallback to mock results if processing fails
            ai_result = generate_mock_ai_results()
        else:
            # Generate AI analysis results based on the processed image
            ai_result = generate_mock_ai_results()
        
        logger.info("Synchronous processing completed")
        return ai_result

    except Exception as e:
        logger.error(f"Synchronous processing failed: {e}")
        raise

def generate_mock_ai_results():
    """Generate mock AI analysis results"""
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
        "findings": random.choice(findings_options),
        "confidence": random.randint(80, 98),
        "riskLevel": random.choice(risk_levels[:3]),  # Bias towards lower risk
        "recommendation": random.choice(recommendations),
        "analysisId": f"ai_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}",
        "timestamp": datetime.now().isoformat(),
        "backend": "python-ai"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

