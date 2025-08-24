#!/usr/bin/env python3
"""
Secure Image Pipeline for Breast Scan AI
Handles image capture, encryption, and secure upload to GCS
"""

import cv2
import numpy as np
import base64
import secrets
import logging
from datetime import datetime
from PIL import Image
import io
from google.cloud import storage
import os
from typing import Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class GCPImageUploader:
    def __init__(self, bucket_name: str):
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)
        logging.info(f"GCPImageUploader initialized for bucket: {bucket_name}")

    def upload_image(self, image_bytes: bytes, filename: str) -> str:
        """
        Uploads an image securely to GCS.
        """
        try:
            blob_name = f"images/{datetime.utcnow().isoformat()}_{filename}"
            blob = self.bucket.blob(blob_name)

            # Enforce server-side encryption (default AES-256)
            blob.upload_from_string(image_bytes, content_type="image/png")
            logging.info(f"Image uploaded successfully: {blob_name}")

            return blob.public_url  # for demo; in prod restrict public access
        except Exception as e:
            logging.error(f"Failed to upload image: {e}")
            raise

class ImageEncryptor:
    """Handles image encryption and encoding"""
    
    def __init__(self, key_b64: str):
        """
        Initialize with base64 encoded encryption key
        
        Args:
            key_b64: Base64 encoded 32-byte key for AES-256
        """
        self.key = base64.b64decode(key_b64)
        if len(self.key) != 32:
            raise ValueError("Encryption key must be 32 bytes for AES-256")
        logger.info("ImageEncryptor initialized with valid key")
    
    def encode_image(self, image_array: np.ndarray) -> bytes:
        """
        Encode image array to PNG bytes
        
        Args:
            image_array: NumPy array of image (H, W, C)
            
        Returns:
            PNG encoded image bytes
        """
        try:
            # Convert to PIL Image
            if image_array.dtype != np.uint8:
                image_array = image_array.astype(np.uint8)
            
            pil_image = Image.fromarray(image_array)
            
            # Convert to PNG bytes
            img_buffer = io.BytesIO()
            pil_image.save(img_buffer, format='PNG')
            img_bytes = img_buffer.getvalue()
            
            logger.info(f"Image encoded to PNG: {len(img_bytes)} bytes")
            return img_bytes
            
        except Exception as e:
            logger.error(f"Failed to encode image: {e}")
            raise
    
    def encrypt_image(self, image_bytes: bytes) -> bytes:
        """
        Encrypt image bytes using AES-256
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Encrypted image bytes
        """
        try:
            from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
            from cryptography.hazmat.primitives import padding
            
            # Generate random IV
            iv = secrets.token_bytes(16)
            
            # Create cipher
            cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv))
            encryptor = cipher.encryptor()
            
            # Pad data
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(image_bytes) + padder.finalize()
            
            # Encrypt
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
            
            # Combine IV + encrypted data
            result = iv + encrypted_data
            
            logger.info(f"Image encrypted: {len(result)} bytes")
            return result
            
        except Exception as e:
            logger.error(f"Failed to encrypt image: {e}")
            raise

class SecureImagePipeline:
    """Main pipeline for secure image processing and upload"""
    
    def __init__(self, key_b64: str, gcs_bucket: str, camera_index: int = 0):
        """
        Initialize the secure image pipeline
        
        Args:
            key_b64: Base64 encoded encryption key
            gcs_bucket: GCS bucket name for uploads
            camera_index: Camera device index
        """
        self.encryptor = ImageEncryptor(key_b64)
        self.gcp_uploader = GCPImageUploader(gcs_bucket)
        self.camera_index = camera_index
        self.camera = None
        logger.info(f"SecureImagePipeline initialized for bucket: {gcs_bucket}")
    
    def _initialize_camera(self):
        """Initialize camera capture"""
        if self.camera is None:
            self.camera = cv2.VideoCapture(self.camera_index)
            if not self.camera.isOpened():
                raise RuntimeError(f"Failed to open camera at index {self.camera_index}")
            logger.info(f"Camera initialized at index {self.camera_index}")
    
    def _release_camera(self):
        """Release camera resources"""
        if self.camera is not None:
            self.camera.release()
            self.camera = None
            logger.info("Camera released")
    
    def capture_image(self) -> np.ndarray:
        """
        Capture a single image from camera
        
        Returns:
            Captured image as NumPy array
        """
        try:
            self._initialize_camera()
            
            # Capture frame
            ret, frame = self.camera.read()
            if not ret:
                raise RuntimeError("Failed to capture frame from camera")
            
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            logger.info(f"Image captured: {frame_rgb.shape}")
            return frame_rgb
            
        except Exception as e:
            logger.error(f"Failed to capture image: {e}")
            raise
        finally:
            self._release_camera()
    
    def process_and_upload(self, image_array: np.ndarray, filename: str = None) -> Tuple[str, str]:
        """
        Process image and upload to GCS
        
        Args:
            image_array: Image as NumPy array
            filename: Optional filename (will generate if not provided)
            
        Returns:
            Tuple of (local_filename, gcs_url)
        """
        try:
            # Generate filename if not provided
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                filename = f"breast_scan_{timestamp}.png"
            
            # Encode image to PNG
            image_bytes = self.encryptor.encode_image(image_array)
            
            # Encrypt image
            encrypted_bytes = self.encryptor.encrypt_image(image_bytes)
            
            # Save encrypted image locally
            local_filename = f"{filename}.enc"
            with open(local_filename, 'wb') as f:
                f.write(encrypted_bytes)
            
            # Upload original PNG to GCS
            gcs_url = self.gcp_uploader.upload_image(image_bytes, filename)
            
            logger.info(f"Image processed and uploaded: {local_filename} -> {gcs_url}")
            return local_filename, gcs_url
            
        except Exception as e:
            logger.error(f"Failed to process and upload image: {e}")
            raise
    
    def run_once(self, filename: str = None) -> str:
        """
        Run the complete pipeline: capture -> process -> upload
        
        Args:
            filename: Optional filename for the image
            
        Returns:
            Local filename of the encrypted image
        """
        try:
            logger.info("Starting secure image pipeline")
            
            # Capture image
            image_array = self.capture_image()
            
            # Process and upload
            local_filename, gcs_url = self.process_and_upload(image_array, filename)
            
            logger.info(f"Pipeline completed successfully: {local_filename}")
            return local_filename
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            raise
    
    def __del__(self):
        """Cleanup on destruction"""
        self._release_camera()

# Convenience function for quick testing
def quick_capture_and_upload(key_b64: str, gcs_bucket: str, filename: str = None) -> Tuple[str, str]:
    """
    Quick function to capture and upload an image
    
    Args:
        key_b64: Base64 encoded encryption key
        gcs_bucket: GCS bucket name
        filename: Optional filename
        
    Returns:
        Tuple of (local_filename, gcs_url)
    """
    pipeline = SecureImagePipeline(key_b64, gcs_bucket)
    try:
        return pipeline.process_and_upload(
            pipeline.capture_image(), 
            filename
        )
    finally:
        del pipeline

if __name__ == "__main__":
    # Example usage
    import os
    
    # Get configuration from environment
    key_b64 = os.getenv("ENCRYPTION_KEY")
    gcs_bucket = os.getenv("GCS_BUCKET")
    
    if not key_b64 or not gcs_bucket:
        print("Please set ENCRYPTION_KEY and GCS_BUCKET environment variables")
        exit(1)
    
    try:
        pipeline = SecureImagePipeline(key_b64, gcs_bucket)
        local_file, gcs_url = pipeline.run_once("test_capture.png")
        print(f"✅ Success! Local file: {local_file}")
        print(f"✅ GCS URL: {gcs_url}")
    except Exception as e:
        print(f"❌ Failed: {e}")
