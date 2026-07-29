#!/usr/bin/env python3
"""
Secure Image Pipeline for Breast Scan AI
Handles image capture, encryption, and local secure storage
"""

import numpy as np
import base64
import secrets
import logging
from datetime import datetime
import os
import time
from typing import Optional, Tuple, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class ImageEncryptor:
    """Handles image encryption without format conversion"""
    
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
    
    def encrypt_image_array(self, image_array: np.ndarray) -> bytes:
        """
        Encrypt image array directly without PNG/JPEG conversion
        
        Args:
            image_array: NumPy array of image (H, W, C)
            
        Returns:
            Encrypted image bytes
        """
        try:
            # Convert NumPy array to bytes directly
            image_bytes = image_array.tobytes()
            
            # Encrypt the raw bytes
            encrypted_bytes = self.encrypt_image(image_bytes)
            
            logger.info(f"Image array encrypted directly: {len(encrypted_bytes)} bytes")
            return encrypted_bytes
            
        except Exception as e:
            logger.error(f"Failed to encrypt image array: {e}")
            raise
    
    def encrypt_image(self, image_bytes: bytes) -> bytes:
        """
        Encrypt image bytes using AES-256-GCM
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Encrypted image bytes (IV + Ciphertext + Tag)
        """
        try:
            from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
            
            # Generate random 12-byte IV for GCM (standard)
            iv = secrets.token_bytes(12)
            
            # Create cipher in GCM mode
            cipher = Cipher(algorithms.AES(self.key), modes.GCM(iv))
            encryptor = cipher.encryptor()
            
            # Encrypt (no padding needed for GCM stream mode)
            encrypted_data = encryptor.update(image_bytes) + encryptor.finalize()
            
            # Get authentication tag (16 bytes)
            tag = encryptor.tag
            
            # Combine IV + encrypted data + tag
            result = iv + encrypted_data + tag
            
            logger.info(f"Image encrypted successfully using AES-GCM: {len(result)} bytes")
            return result
            
        except Exception as e:
            logger.error(f"Failed to encrypt image: {e}")
            raise
    
    def decrypt_image(self, encrypted_bytes: bytes) -> bytes:
        """
        Decrypt image bytes using AES-256-GCM
        
        Args:
            encrypted_bytes: Encrypted image bytes (IV + ciphertext + tag)
            
        Returns:
            Decrypted image bytes
        """
        try:
            from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
            
            # Extract IV (first 12 bytes) and Tag (last 16 bytes)
            iv = encrypted_bytes[:12]
            tag = encrypted_bytes[-16:]
            encrypted_data = encrypted_bytes[12:-16]
            
            # Create cipher in GCM mode with verification tag
            cipher = Cipher(algorithms.AES(self.key), modes.GCM(iv, tag))
            decryptor = cipher.decryptor()
            
            # Decrypt and authenticate
            result = decryptor.update(encrypted_data) + decryptor.finalize()
            
            logger.info(f"Image decrypted and verified successfully: {len(result)} bytes")
            return result
            
        except Exception as e:
            logger.error(f"Failed to decrypt/verify image: {e}")
            raise

class SecureImagePipeline:
    """Handles image encryption and storage (local + cloud)"""
    
    def __init__(self, gcp_project_id: str = None, gcp_secret_id: str = None, encryption_key: str = None, gcs_bucket: str = None):
        if gcp_project_id and gcp_secret_id:
            key_b64 = self._fetch_key_from_secret_manager(gcp_project_id, gcp_secret_id)
        elif encryption_key:
            key_b64 = encryption_key
        else:
            raise ValueError("Must provide either Secret Manager credentials or an encryption_key")
            
        self.encryptor = ImageEncryptor(key_b64)
        self.gcs_bucket = gcs_bucket
        if gcs_bucket:
            try:
                import google.cloud.storage
                self.storage_client = google.cloud.storage.Client()
                self.bucket = self.storage_client.bucket(gcs_bucket)
                logger.info(f"GCS bucket initialized: {gcs_bucket}")
            except ImportError:
                logger.warning("Google Cloud Storage not available")
                self.bucket = None
        else:
            self.bucket = None
            
    def _fetch_key_from_secret_manager(self, project_id: str, secret_id: str, version_id: str = "latest") -> str:
        """Fetch encryption key from GCP Secret Manager"""
        try:
            from google.cloud import secretmanager
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
            response = client.access_secret_version(request={"name": name})
            key_b64 = response.payload.data.decode("UTF-8")
            logger.info(f"Successfully fetched encryption key from Secret Manager: {secret_id}")
            return key_b64
        except Exception as e:
            logger.error(f"Failed to fetch key from Secret Manager: {e}")
            raise
    
    def generate_unique_id(self, user_id: str, prefix: str = "scan") -> str:
        """Generate unique ID for scans, images, etc."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        random_suffix = secrets.token_hex(4)
        return f"{prefix}_{user_id}_{timestamp}_{random_suffix}"
    
    def process_and_store(self, image_array: np.ndarray, user_id: str, scan_id: str = None) -> Dict[str, Any]:
        """
        Process image and store both locally and in cloud with unique IDs
        
        Args:
            image_array: Image as NumPy array
            user_id: Firebase user ID
            scan_id: Optional scan ID (will generate if not provided)
            
        Returns:
            Dictionary with storage information and unique IDs
        """
        try:
            # Generate scan ID if not provided
            if scan_id is None:
                scan_id = self.generate_unique_id(user_id, "scan")
            
            # Generate unique image ID
            image_id = f"{scan_id}_img_{int(time.time() * 1000)}"
            
            # Encrypt image array directly (no PNG/JPEG conversion)
            encrypted_bytes = self.encryptor.encrypt_image_array(image_array)
            
            # Upload directly to cloud storage from memory
            cloud_path = None
            if self.bucket:
                cloud_filename = f"ai_training/{user_id}/{scan_id}/{image_id}.enc"
                blob = self.bucket.blob(cloud_filename)
                blob.upload_from_string(encrypted_bytes)
                cloud_path = f"gs://{self.gcs_bucket}/{cloud_filename}"
                logger.info(f"Image uploaded directly to cloud from memory: {cloud_path}")
            else:
                logger.warning("No GCS bucket configured. Image processed in memory but not saved.")
            
            return {
                "scan_id": scan_id,
                "image_id": image_id,
                "cloud_path": cloud_path,
                "encrypted_size": len(encrypted_bytes),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to process and store image: {e}")
            raise
    

if __name__ == "__main__":
    # Example usage
    print("Secure Image Pipeline - Encrypted Binary Storage Only")
    print("This pipeline stores images as encrypted binary data (no PNG/JPEG formats)")
