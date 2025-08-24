#!/usr/bin/env python3
"""
Test GCP upload functionality with a sample image
"""

import os
import base64
import numpy as np
from PIL import Image
import io

def create_test_image():
    """Create a test image for testing"""
    # Create a simple test image (100x100 pixels, blue color)
    image_array = np.zeros((100, 100, 3), dtype=np.uint8)
    image_array[:, :, 2] = 255  # Blue channel
    
    # Convert to PIL Image
    image = Image.fromarray(image_array)
    
    # Convert to base64
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    image_bytes = buffer.getvalue()
    base64_string = base64.b64encode(image_bytes).decode('utf-8')
    
    return base64_string, image_array

def test_gcp_pipeline():
    """Test the GCP pipeline with a test image"""
    print("🧪 Testing GCP Pipeline Integration")
    print("=" * 40)
    
    # Check environment variables
    gcs_bucket = os.getenv("GCS_BUCKET")
    encryption_key = os.getenv("ENCRYPTION_KEY")
    
    if not gcs_bucket:
        print("❌ GCS_BUCKET environment variable not set")
        print("Please set: export GCS_BUCKET='your-bucket-name'")
        return False
    
    if not encryption_key:
        print("❌ ENCRYPTION_KEY environment variable not set")
        print("Please set: export ENCRYPTION_KEY='your-base64-key'")
        return False
    
    print(f"✅ GCS Bucket: {gcs_bucket}")
    print(f"✅ Encryption Key: {encryption_key[:20]}...")
    
    try:
        # Import the pipeline
        from secure_image_pipeline import SecureImagePipeline
        
        # Create test image
        print("\n🖼️ Creating test image...")
        base64_image, image_array = create_test_image()
        print(f"✅ Test image created: {image_array.shape}")
        
        # Initialize pipeline
        print("\n🔧 Initializing pipeline...")
        pipeline = SecureImagePipeline(encryption_key, gcs_bucket)
        print("✅ Pipeline initialized")
        
        # Test image processing and upload
        print("\n☁️ Testing image processing and upload...")
        local_filename, gcs_url = pipeline.process_and_upload(
            image_array, 
            "test_breast_scan.png"
        )
        
        print(f"✅ Local encrypted file: {local_filename}")
        print(f"✅ GCS URL: {gcs_url}")
        
        # Verify local file exists
        if os.path.exists(local_filename):
            file_size = os.path.getsize(local_filename)
            print(f"✅ Local file verified: {file_size} bytes")
        else:
            print("❌ Local file not found")
            return False
        
        # Clean up test file
        os.remove(local_filename)
        print("🧹 Test file cleaned up")
        
        print("\n🎉 GCP Pipeline Test Completed Successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_gcp_pipeline()
    if success:
        print("\n✅ You're ready to use the GCP integration!")
        print("Next: Start your backend with 'python main.py'")
    else:
        print("\n❌ Please fix the issues above before proceeding")
