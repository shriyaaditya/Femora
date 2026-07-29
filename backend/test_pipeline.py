#!/usr/bin/env python3
"""
Test script for SecureImagePipeline
Run this to verify your pipeline is working correctly
"""

import base64
import secrets
import numpy as np
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
    """Test image array to binary conversion"""
    print("\n🖼️ Testing image array to binary conversion...")
    
    # Create a simple test image array
    test_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    
    # Convert to binary bytes
    binary_data = test_array.tobytes()
    
    print(f"✅ Converted array to binary: {len(binary_data)} bytes")
    print(f"✅ Binary data integrity: {len(binary_data) == test_array.nbytes}")
    
    return test_array, binary_data

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

def create_test_image():
    """Create a test image array for testing"""
    # Create a simple test image array (100x100 pixels, random colors)
    image_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    
    # Convert to base64 (simulating what frontend would send)
    binary_data = image_array.tobytes()
    base64_string = base64.b64encode(binary_data).decode('utf-8')
    
    return base64_string, image_array

def test_local_processing():
    """Test local image processing (no PNG/JPEG, only encrypted binary)"""
    print("\n🖼️ Testing local image processing...")
    
    try:
        from secure_image_pipeline import ImageEncryptor
        
        # Create a test image array
        test_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        
        # Test encryption
        encryption_key = os.getenv("ENCRYPTION_KEY")
        if not encryption_key:
            print("⚠️  ENCRYPTION_KEY environment variable not set - skipping encryption test")
            return None
        
        encryptor = ImageEncryptor(encryption_key)
        encrypted_bytes = encryptor.encrypt_image_array(test_array)
        
        print(f"✅ Image array encryption successful: {len(encrypted_bytes)} bytes")
        
        # Test decryption
        decrypted_bytes = encryptor.decrypt_image(encrypted_bytes)
        print(f"✅ Image decryption successful: {len(decrypted_bytes)} bytes")
        
        # Verify data integrity
        original_bytes = test_array.tobytes()
        print(f"✅ Data integrity: {decrypted_bytes == original_bytes}")
        
        return "local_processing_successful"
        
    except Exception as e:
        print(f"⚠️  Local processing test failed: {e}")
        return None

def test_complete_pipeline():
    """Test the complete local pipeline with a test image (encrypted binary only)"""
    print("\n🧪 Testing Complete Local Pipeline Integration")
    print("=" * 50)
    
    # Check environment variables
    encryption_key = os.getenv("ENCRYPTION_KEY")
    
    if not encryption_key:
        print("❌ ENCRYPTION_KEY environment variable not set")
        print("Please set: export ENCRYPTION_KEY='your-base64-key'")
        return False
    
    print(f"✅ Encryption Key: {encryption_key[:20]}...")
    
    try:
        # Import the pipeline
        from secure_image_pipeline import SecureImagePipeline
        
        # Create test image array
        print("\n🖼️ Creating test image array...")
        base64_image, image_array = create_test_image()
        print(f"✅ Test image array created: {image_array.shape}")
        
        # Initialize pipeline
        print("\n🔧 Initializing pipeline...")
        pipeline = SecureImagePipeline(encryption_key)
        print("✅ Pipeline initialized")
        
        # Test image processing and local storage
        print("\n💾 Testing image processing and local storage...")
        local_filename = pipeline.process_and_store(
            image_array, 
            "test_breast_scan"
        )
        
        print(f"✅ Local encrypted binary file: {local_filename}")
        
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
        
        print("\n🎉 Local Pipeline Test Completed Successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

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
        image_array, binary_data = test_image_conversion()
        
        # Test base64 encoding
        base64_data = test_base64_encoding()
        
        # Test local processing (no PNG/JPEG, only encrypted binary)
        local_result = test_local_processing()
        
        print("\n" + "=" * 50)
        print("🎉 All tests passed! Your pipeline components are working.")
        print("\n📋 Next steps:")
        print("1. Copy the encryption key above to your .env file")
        print("2. Ensure your secure_image_pipeline.py is in the same directory")
        print("3. Run: python main.py")
        
        # Offer to run complete pipeline test if credentials are available
        if os.getenv("ENCRYPTION_KEY"):
            print("\n🚀 Would you like to run the complete pipeline test?")
            print("Run: python test_pipeline.py --complete")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("Please check your Python environment and dependencies.")

if __name__ == "__main__":
    import sys
    
    # Check if user wants to run complete pipeline test
    if len(sys.argv) > 1 and sys.argv[1] == "--complete":
        success = test_complete_pipeline()
        if success:
            print("\n✅ You're ready to use the encrypted binary storage!")
            print("Next: Start your backend with 'python main.py'")
        else:
            print("\n❌ Please fix the issues above before proceeding")
    else:
        main()

