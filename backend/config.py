#!/usr/bin/env python3
"""
Configuration file for Breast Scan AI Backend
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Backend configuration
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MORA_BACKEND_URL = os.getenv("MORA_BACKEND_URL")

# GCS Configuration for cloud storage
GCS_BUCKET = os.getenv("GCS_BUCKET")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Camera configuration
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))

# Validate required configuration
if not ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY environment variable is required")

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is required")

# Print configuration (without sensitive data)
print("🔧 Backend Configuration:")
print(f"   Encryption Key: {'✅ Set' if ENCRYPTION_KEY else '❌ Missing'}")
print(f"   JWT Secret: {'✅ Set' if JWT_SECRET_KEY else '❌ Missing'}")
print(f"   Google API Key: {'✅ Set' if GOOGLE_API_KEY else '❌ Missing'}")
print(f"   Mora Backend: {'✅ Set' if MORA_BACKEND_URL else '❌ Missing'}")
print(f"   GCS Bucket: {'✅ Set' if GCS_BUCKET else '❌ Missing'}")
print(f"   GCS Credentials: {'✅ Set' if GOOGLE_APPLICATION_CREDENTIALS else '❌ Missing'}")
print(f"   Camera Index: {CAMERA_INDEX}")
