#!/usr/bin/env python3
"""
Test script to check backend status and image processing endpoints
Run this to verify your backend is working correctly
"""

import requests
import json
import time

# Backend configuration
BACKEND_URL = os.environ.get("DEV_IMAGE_BACKEND_URL", "http://${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}")
ENDPOINTS = {
    "health": "/health",
    "upload": "/api/upload-image",
    "status": "/api/status",
    "gcp_upload": "/api/gcp-upload"
}

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        response = requests.get(f"{BACKEND_URL}{ENDPOINTS['health']}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is healthy and running!")
            print(f"   Pipeline Type: {data.get('pipeline_type', 'unknown')}")
            print(f"   Pipeline Ready: {data.get('pipeline_ready', False)}")
            print(f"   GCS Bucket: {data.get('config', {}).get('gcs_bucket', 'unknown')}")
            print(f"   GCP Project: {data.get('config', {}).get('gcp_project', 'unknown')}")
            print(f"   Credentials Available: {data.get('config', {}).get('credentials_available', False)}")
            
            if data.get('pipeline_type') == 'mock':
                print("⚠️ Running in MOCK mode - images won't be stored in GCP")
            elif data.get('pipeline_type') == 'gcp':
                print("🔥 Running with REAL GCP integration!")
                
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        print("   Start backend with: ./start_backend.sh")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_image_upload():
    """Test image upload endpoint"""
    try:
        # Create a mock image (base64 encoded small image)
        mock_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        payload = {
            "image": mock_image,
            "metadata": {
                "userId": "test_user",
                "scanType": "breast-scan",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer test_token"
        }
        
        response = requests.post(
            f"{BACKEND_URL}{ENDPOINTS['upload']}", 
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Image upload successful!")
            print(f"   Processing ID: {result.get('processingId')}")
            print(f"   Message: {result.get('message')}")
            return result.get('processingId')
        else:
            print(f"❌ Image upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Upload test error: {e}")
        return None

def test_status_check(processing_id):
    """Test status checking endpoint"""
    if not processing_id:
        print("❌ No processing ID to check")
        return
    
    try:
        headers = {"Authorization": "Bearer test_token"}
        
        response = requests.get(
            f"{BACKEND_URL}{ENDPOINTS['status']}/{processing_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            status = response.json()
            print("✅ Status check successful!")
            print(f"   Status: {status.get('status')}")
            print(f"   Progress: {status.get('progress')}%")
            if status.get('result'):
                print(f"   Result: {json.dumps(status.get('result'), indent=2)}")
            return status
        else:
            print(f"❌ Status check failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return None

def test_gcp_upload():
    """Test the secure GCP upload endpoint"""
    try:
        # Create a mock image (base64 encoded small image)
        mock_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        payload = {
            "image": mock_image,
            "metadata": {
                "userId": "test_user",
                "scanId": "test_scan_123",
                "scanType": "breast-scan",
                "quality": 95
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer test_token"
        }
        
        response = requests.post(
            f"{BACKEND_URL}{ENDPOINTS['gcp_upload']}", 
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ GCP upload successful!")
            print(f"   Processing ID: {result.get('processingId')}")
            print(f"   GCP URL: {result.get('gcpUrl')}")
            print(f"   Firestore ID: {result.get('firestoreId')}")
            return result.get('processingId')
        else:
            print(f"❌ GCP upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ GCP upload test error: {e}")
        return None

def main():
    """Run all tests"""
    print("🔬 Testing Femora Backend Status")
    print("=" * 40)
    
    # Test 1: Backend health
    print("\n1. Testing backend health...")
    if not test_backend_health():
        return
    
    # Test 2: Image upload
    print("\n2. Testing image upload...")
    processing_id = test_image_upload()
    
    # Test 3: Status checking
    if processing_id:
        print("\n3. Testing status checking...")
        # Wait a bit for processing to start
        time.sleep(2)
        test_status_check(processing_id)
    
    # Test 4: GCP upload (secure flow)
    print("\n4. Testing secure GCP upload...")
    gcp_processing_id = test_gcp_upload()
    
    print("\n" + "=" * 40)
    print("✅ Backend testing completed!")
    
    if gcp_processing_id:
        print(f"\n💡 Your backend is working! Processing ID: {gcp_processing_id}")
        print("   You can now use the app to capture and process images.")
    else:
        print("\n⚠️  Some tests failed. Check your backend configuration.")

if __name__ == "__main__":
    main()
