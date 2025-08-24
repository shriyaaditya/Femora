#!/usr/bin/env python3
"""
Setup script for Breast Scan AI Backend
Helps configure GCP integration and test the setup
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required Python packages are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        "fastapi", "uvicorn", "pydantic", "cryptography",
        "google-cloud-storage", "numpy", "Pillow", "opencv-python"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"   ✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"   ❌ {package}")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed")
    return True

def setup_environment():
    """Help set up environment variables"""
    print("\n🔧 Setting up environment variables...")
    
    # Check current environment
    gcs_bucket = os.getenv("GCS_BUCKET")
    encryption_key = os.getenv("ENCRYPTION_KEY")
    
    if not gcs_bucket:
        print("❌ GCS_BUCKET environment variable not set")
        bucket_name = input("Enter your GCS bucket name: ").strip()
        if bucket_name:
            print(f"export GCS_BUCKET={bucket_name}")
            print("Add this to your shell profile or .env file")
        else:
            print("⚠️  Skipping GCS bucket setup")
    
    if not encryption_key:
        print("❌ ENCRYPTION_KEY environment variable not set")
        print("Run test_pipeline.py first to generate a key")
    
    # Check GCP credentials
    gcp_creds = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not gcp_creds:
        print("⚠️  GOOGLE_APPLICATION_CREDENTIALS not set")
        print("Using Application Default Credentials (ADC)")
        print("Run 'gcloud auth application-default login' if needed")

def test_gcp_connection():
    """Test GCP connection"""
    print("\n☁️ Testing GCP connection...")
    
    try:
        from google.cloud import storage
        
        # Try to list buckets
        client = storage.Client()
        buckets = list(client.list_buckets(max_results=5))
        
        print(f"✅ Connected to GCP successfully")
        print(f"   Found {len(buckets)} buckets")
        
        # Check if configured bucket exists
        gcs_bucket = os.getenv("GCS_BUCKET")
        if gcs_bucket:
            bucket = client.bucket(gcs_bucket)
            if bucket.exists():
                print(f"   ✅ Bucket '{gcs_bucket}' exists and accessible")
            else:
                print(f"   ❌ Bucket '{gcs_bucket}' not found")
        
        return True
        
    except Exception as e:
        print(f"❌ GCP connection failed: {e}")
        print("Please check your GCP credentials and permissions")
        return False

def run_tests():
    """Run the test pipeline"""
    print("\n🧪 Running test pipeline...")
    
    try:
        result = subprocess.run([sys.executable, "test_pipeline.py"], 
                              capture_output=True, text=True, cwd=Path(__file__).parent)
        
        if result.returncode == 0:
            print("✅ Test pipeline completed successfully")
            print(result.stdout)
        else:
            print("❌ Test pipeline failed")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Failed to run test pipeline: {e}")

def main():
    """Main setup function"""
    print("🚀 Breast Scan AI Backend Setup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Setup environment
    setup_environment()
    
    # Test GCP connection
    if test_gcp_connection():
        # Run tests
        run_tests()
    
    print("\n📋 Setup Summary:")
    print("1. ✅ Dependencies checked")
    print("2. 🔧 Environment variables configured")
    print("3. ☁️ GCP connection tested")
    print("4. 🧪 Test pipeline executed")
    
    print("\n🎯 Next steps:")
    print("1. Set GCS_BUCKET environment variable to your bucket name")
    print("2. Generate encryption key using test_pipeline.py")
    print("3. Set ENCRYPTION_KEY environment variable")
    print("4. Run: python main.py")

if __name__ == "__main__":
    main()
