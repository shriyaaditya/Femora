#!/usr/bin/env python3
"""
Simple script to create .env file in the correct Femora folder
"""

import os
from pathlib import Path

def create_env_file():
    """Create .env file with network configuration"""
    
    print("🔧 Creating .env file in Femora folder...")
    
    # Get current directory
    current_dir = Path.cwd()
    
    # If we're not in Femora folder, try to find it
    if not (current_dir / "config").exists():
        if (current_dir.parent / "Femora").exists():
            current_dir = current_dir.parent / "Femora"
            print(f"📁 Found Femora folder: {current_dir}")
        else:
            print("❌ Error: Please run this script from the Femora folder")
            return
    
    env_file = current_dir / ".env"
    
    # Check if .env already exists
    if env_file.exists():
        print(f"⚠️  .env file already exists at: {env_file}")
        response = input("Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Operation cancelled.")
            return
    
    # Create .env content
    env_content = f"""# ========================================
# FEMORA ENVIRONMENT CONFIGURATION
# ========================================
# Network Configuration (Android Compatible)
DEV_BACKEND_HOST=10.133.147.50
DEV_IMAGE_BACKEND_HOST=10.133.147.50
DEV_FRONTEND_HOST=localhost

# Backend Ports
DEV_MORA_BACKEND_PORT=5002
DEV_IMAGE_BACKEND_PORT=8000
DEV_FRONTEND_PORT=8081

# Constructed URLs for Android access
DEV_MORA_BACKEND_URL=http://10.133.147.50:5002
DEV_IMAGE_BACKEND_URL=http://10.133.147.50:8000
DEV_FRONTEND_URL=http://${DEV_FRONTEND_HOST:-localhost}:${DEV_FRONTEND_PORT:-8081}

# Backend Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
MORA_BACKEND_PORT=5002

# Security
ENCRYPTION_KEY=Zp7aqUqpU6YT9vFoZPZSIQY2gkzzXfrK5xS3vqZIaWI=
JWT_SECRET=your-jwt-secret-key-here

# Google Cloud Platform
GCP_PROJECT_ID=femora-5d93e
GCS_BUCKET=femora_images
GCP_CREDENTIALS_FILE=femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json

# Firestore
FIRESTORE_COLLECTION=breast_scans
FIREBASE_CREDENTIALS_PATH=./femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json

# AI/ML
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_MODEL=gemini-1.5-flash

# Database
CHROMA_DB_PATH=./mora/chroma_db

# Environment
NODE_ENV=development
DEBUG=true
"""
    
    # Write .env file
    try:
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print(f"✅ Created .env file at: {env_file}")
        print("📝 Next steps:")
        print("1. Edit the .env file to add your real API keys")
        print("2. Start the backends: ./start_backends_for_android.sh")
        print("3. Test connectivity")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

if __name__ == "__main__":
    create_env_file()
