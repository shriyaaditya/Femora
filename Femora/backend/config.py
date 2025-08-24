#!/usr/bin/env python3
"""
Configuration file for Breast Scan AI Backend
"""

import os
from typing import Optional

class Config:
    """Configuration class for the application"""
    
    # GCP Configuration
    GCS_BUCKET: str = os.getenv("GCS_BUCKET", "your-gcs-bucket-name-here")
    
    # Encryption Key (generate using test_pipeline.py)
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-base64-encryption-key-here")
    
    # Camera Configuration
    CAMERA_INDEX: int = int(os.getenv("CAMERA_INDEX", "0"))
    
    # GCP Authentication
    # Set GOOGLE_APPLICATION_CREDENTIALS to your service account key file path
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is set"""
        required_vars = ["GCS_BUCKET", "ENCRYPTION_KEY"]
        missing_vars = []
        
        for var in required_vars:
            if getattr(cls, var) == f"your-{var.lower()}-here":
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Missing required configuration: {', '.join(missing_vars)}")
            print("Please set these environment variables or update config.py")
            return False
        
        return True
    
    @classmethod
    def print_config(cls):
        """Print current configuration (without sensitive data)"""
        print("🔧 Current Configuration:")
        print(f"   GCS Bucket: {cls.GCS_BUCKET}")
        print(f"   Camera Index: {cls.CAMERA_INDEX}")
        print(f"   Encryption Key: {'✅ Set' if cls.ENCRYPTION_KEY != 'your-base64-encryption-key-here' else '❌ Not Set'}")
        print(f"   GCP Credentials: {'✅ Set' if cls.GOOGLE_APPLICATION_CREDENTIALS else '⚠️  Using ADC'}")
        print()

# Global config instance
config = Config()
