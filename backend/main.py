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
from secure_image_pipeline import SecureImagePipeline, ImageEncryptor, GCSUploader

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
    "encryption_key": "your-base64-encryption-key-here",  # Replace with your actual key
    "gcs_bucket": "your-gcs-bucket-name",  # Replace with your actual bucket
    "camera_index": 0
}

# Initialize pipeline
try:
    pipeline = SecureImagePipeline(
        key_b64=CONFIG["encryption_key"],
        gcs_bucket=CONFIG["gcs_bucket"]
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
    gcpUrl: Optional[str] = None  # GCP URL for encrypted image
    firestoreId: Optional[str] = None  # Firestore document ID

class ProcessingStatus(BaseModel):
    status: str  # 'pending', 'processing', 'completed', 'failed'
    progress: int
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    gcpUrl: Optional[str] = None  # GCP URL for encrypted image
    firestoreId: Optional[str] = None  # Firestore document ID

# In-memory storage for processing status (replace with database in production)
processing_status: Dict[str, Dict[str, Any]] = {}

# Mock authentication (replace with proper JWT validation)
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    # In production, implement proper JWT validation
    token = credentials.credentials
    # For now, just return the token as user ID
    return token

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "pipeline_ready": pipeline is not None
    }

# NEW: GCP Upload Endpoint - Implements the secure image flow
@app.post("/api/gcp-upload", response_model=ImageUploadResponse)
async def gcp_upload_image(
    request: ImageUploadRequest,
    token: str = Depends(verify_token)
):
    """SECURE IMAGE FLOW: Capture → Encrypt → Upload to GCP → Store Metadata in Firestore"""
    try:
        logger.info("🔐 Starting SECURE image flow...")
        logger.info("⚠️ NO LOCAL IMAGE STORAGE - Images encrypted and sent to GCP only")
        
        if not pipeline:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Secure image pipeline not available"
            )

        # Extract user ID from token (in production, decode JWT)
        user_id = token
        
        # Generate scan ID if not provided
        scan_id = request.metadata.get('scanId', f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}")
        
        # Process image through secure pipeline
        result = pipeline.process_image(
            base64_image=request.image,
            user_id=user_id,
            scan_id=scan_id,
            metadata=request.metadata
        )
        
        if result['success']:
            logger.info("✅ SECURE image flow completed successfully")
            logger.info(f"🔒 Image encrypted and stored in GCP: {result['gcp_url']}")
            logger.info(f"📊 Metadata stored in Firestore: {result['firestore_id']}")
            
            return ImageUploadResponse(
                success=True,
                message="Image securely processed and stored in GCP",
                processingId=scan_id,
                gcpUrl=result['gcp_url'],
                firestoreId=result['firestore_id']
            )
        else:
            logger.error(f"❌ SECURE image flow failed: {result['error']}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Secure image processing failed: {result['error']}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ SECURE image flow failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SECURE image flow failed: {str(e)}"
        )

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
        
        return ProcessingStatus(
            status="completed",
            progress=100,
            result=result
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
    
    try:
        if processing_id not in processing_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processing ID not found"
            )

        status_data = processing_status[processing_id]
        
        return ProcessingStatus(
            status=status_data["status"],
            progress=status_data.get("progress", 0),
            result=status_data.get("result"),
            error=status_data.get("error")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check failed: {str(e)}"
        )

# Helper functions
async def process_image_async(processing_id: str, image_data: bytes, metadata: Dict[str, Any]):
    """Process image asynchronously"""
    try:
        # Update status to processing
        processing_status[processing_id]["status"] = "processing"
        processing_status[processing_id]["progress"] = 25

        # Simulate processing delay
        await asyncio.sleep(2)
        
        # Update progress
        processing_status[processing_id]["progress"] = 75
        
        # Simulate AI analysis
        await asyncio.sleep(1)
        
        # Update status to completed
        processing_status[processing_id]["status"] = "completed"
        processing_status[processing_id]["progress"] = 100
        processing_status[processing_id]["result"] = {
            "findings": "Sample analysis results",
            "confidence": 0.85,
            "riskLevel": "low",
            "recommendation": "Continue regular monitoring"
        }
        
        logger.info(f"Async processing completed for {processing_id}")
        
    except Exception as e:
        logger.error(f"Async processing failed for {processing_id}: {e}")
        processing_status[processing_id]["status"] = "failed"
        processing_status[processing_id]["error"] = str(e)

async def process_image_sync(image_data: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Process image synchronously"""
    try:
        # Simulate processing
        await asyncio.sleep(1)
        
        return {
            "findings": "Synchronous analysis results",
            "confidence": 0.90,
            "riskLevel": "low",
            "recommendation": "Continue regular monitoring"
        }
        
    except Exception as e:
        logger.error(f"Sync processing failed: {e}")
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



