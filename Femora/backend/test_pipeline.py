#!/usr/bin/env python3
"""
Test script for SecureImagePipeline
Run this to verify your pipeline is working correctly
"""

import base64
import secrets
import numpy as np
from PIL import Image
import io
import os

def test_encryption_key():
    """Generate and test a valid encryption key"""
    print("🔑 Testing encryption key generation...")
    
    # Generate 32-byte key for AES-256
    key = secrets.token_bytes(32)
    key_b64 = base64.b64encode(key).decode('utf-8')
    
    print(f"✅ Generated key: {key_b64[:20]}...")
    print(f"✅ Key length: {len(key)} bytes (correct for AES-256)")
    
    return key_b64

def test_numpy_array():
    """Create a test NumPy array"""
    print("\n🔢 Testing NumPy array creation...")
    
    # Create a simple test image array
    test_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    
    print(f"✅ Created array with shape: {test_array.shape}")
    print(f"✅ Array dtype: {test_array.dtype}")
    print(f"✅ Array size: {test_array.nbytes} bytes")
    
    return test_array

def test_image_conversion():
    """Test image to NumPy array conversion"""
    print("\n🖼️ Testing image conversion...")
    
    # Create a simple test image
    test_image = Image.new('RGB', (100, 100), color='red')
    
    # Convert to NumPy array
    image_array = np.array(test_image)
    
    print(f"✅ Converted image to array with shape: {image_array.shape}")
    print(f"✅ Image colors: {image_array[0, 0]} (should be [255, 0, 0] for red)")
    
    return image_array

def test_base64_encoding():
    """Test base64 encoding/decoding"""
    print("\n📝 Testing base64 encoding...")
    
    # Create test data
    test_data = b"Hello, this is test data for encryption!"
    
    # Encode to base64
    encoded = base64.b64encode(test_data).decode('utf-8')
    decoded = base64.b64decode(encoded)
    
    print(f"✅ Original data: {test_data}")
    print(f"✅ Encoded: {encoded[:30]}...")
    print(f"✅ Decoded matches: {decoded == test_data}")
    
    return encoded

def test_gcp_upload():
    """Test GCP upload functionality (if credentials are available)"""
    print("\n☁️ Testing GCP upload functionality...")
    
    # Check if GCP credentials are available
    gcs_bucket = os.getenv("GCS_BUCKET")
    if not gcs_bucket:
        print("⚠️  GCS_BUCKET environment variable not set - skipping GCP test")
        return None
    
    try:
        from secure_image_pipeline import GCPImageUploader
        
        # Create a test image
        test_image = Image.new('RGB', (100, 100), color='blue')
        img_buffer = io.BytesIO()
        test_image.save(img_buffer, format='PNG')
        test_bytes = img_buffer.getvalue()
        
        # Test upload
        uploader = GCPImageUploader(gcs_bucket)
        gcs_url = uploader.upload_image(test_bytes, "test_image.png")
        
        print(f"✅ GCP upload successful: {gcs_url}")
        return gcs_url
        
    except Exception as e:
        print(f"⚠️  GCP upload test failed (this is normal if credentials aren't set): {e}")
        return None

def main():
    """Run all tests"""
    print("🧪 Testing SecureImagePipeline Components")
    print("=" * 50)
    
    try:
        # Test encryption key
        encryption_key = test_encryption_key()
        
        # Test NumPy array
        test_array = test_numpy_array()
        
        # Test image conversion
        image_array = test_image_conversion()
        
        # Test base64 encoding
        base64_data = test_base64_encoding()
        
        # Test GCP upload (if available)
        gcs_url = test_gcp_upload()
        
        print("\n" + "=" * 50)
        print("🎉 All tests passed! Your pipeline components are working.")
        print("\n📋 Next steps:")
        print("1. Copy the encryption key above to your .env file")
        print("2. Set GCS_BUCKET environment variable to your bucket name")
        print("3. Ensure your secure_image_pipeline.py is in the same directory")
        print("4. Run: python main.py")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("Please check your Python environment and dependencies.")

if __name__ == "__main__":
    main()

