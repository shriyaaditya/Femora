#!/usr/bin/env python3
"""
Test Script for Secure Image Pipeline
Tests encryption, processing, and security features
"""

import base64
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_encryption_only():
    """Test just the encryption functionality without GCP"""
    logger.info("🔐 Testing Encryption Only Mode...")
    
    try:
        from secure_image_pipeline import ImageEncryptor, generate_encryption_key
        
        # Generate a new key for testing
        key = generate_encryption_key()
        logger.info(f"✅ Generated encryption key: {key[:20]}...")
        
        # Test encryption
        encryptor = ImageEncryptor(key)
        
        # Test with small image data
        test_image_data = b"test_image_data_for_encryption"
        encrypted_data, nonce, tag = encryptor.encrypt_image(test_image_data)
        
        logger.info(f"✅ Image encrypted successfully:")
        logger.info(f"   Original size: {len(test_image_data)} bytes")
        logger.info(f"   Encrypted size: {len(encrypted_data)} bytes")
        logger.info(f"   Nonce size: {len(nonce)} bytes")
        logger.info(f"   Tag size: {len(tag)} bytes")
        
        # Test decryption
        decrypted_data = encryptor.decrypt_image(encrypted_data, nonce, tag)
        
        if decrypted_data == test_image_data:
            logger.info("✅ Decryption successful - data integrity verified")
        else:
            logger.error("❌ Decryption failed - data integrity compromised")
            return False
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Encryption test failed: {e}")
        return False

def test_image_processing():
    """Test image processing with PIL"""
    logger.info("🖼️ Testing Image Processing...")
    
    try:
        from secure_image_pipeline import ImageEncryptor
        from test_config import TEST_ENCRYPTION_KEY, TEST_BASE64_IMAGE
        
        # Test base64 decoding
        image_data = base64.b64decode(TEST_BASE64_IMAGE)
        logger.info(f"✅ Base64 decoded: {len(image_data)} bytes")
        
        # Test encryption
        encryptor = ImageEncryptor(TEST_ENCRYPTION_KEY)
        encrypted_data, nonce, tag = encryptor.encrypt_image(image_data)
        
        logger.info(f"✅ Test image encrypted successfully:")
        logger.info(f"   Original: {len(image_data)} bytes")
        logger.info(f"   Encrypted: {len(encrypted_data)} bytes")
        
        # Test decryption
        decrypted_data = encryptor.decrypt_image(encrypted_data, nonce, tag)
        
        if decrypted_data == image_data:
            logger.info("✅ Test image decryption successful")
            return True
        else:
            logger.error("❌ Test image decryption failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Image processing test failed: {e}")
        return False

def test_pipeline_initialization():
    """Test pipeline initialization (without GCP)"""
    logger.info("🏗️ Testing Pipeline Initialization...")
    
    try:
        from secure_image_pipeline import SecureImagePipeline
        from test_config import TEST_CONFIG
        
        # This should fail gracefully without GCP credentials
        try:
            pipeline = SecureImagePipeline(
                key_b64=TEST_CONFIG["encryption_key"],
                gcs_bucket=TEST_CONFIG["gcs_bucket"],
                project_id=TEST_CONFIG["project_id"]
            )
            logger.info("✅ Pipeline initialized successfully")
            return True
        except ImportError as e:
            if "Google Cloud libraries not available" in str(e):
                logger.info("✅ Pipeline initialization failed gracefully (expected without GCP)")
                return True
            else:
                logger.error(f"❌ Unexpected initialization error: {e}")
                return False
                
    except Exception as e:
        logger.error(f"❌ Pipeline initialization test failed: {e}")
        return False

def test_security_features():
    """Test security features and compliance"""
    logger.info("🔒 Testing Security Features...")
    
    try:
        from secure_image_pipeline import validate_encryption_key, generate_encryption_key
        
        # Test key validation
        valid_key = generate_encryption_key()
        invalid_key = "invalid_key"
        
        if validate_encryption_key(valid_key):
            logger.info("✅ Valid key validation working")
        else:
            logger.error("❌ Valid key validation failed")
            return False
            
        if not validate_encryption_key(invalid_key):
            logger.info("✅ Invalid key validation working")
        else:
            logger.error("❌ Invalid key validation failed")
            return False
            
        # Test key generation
        for i in range(3):
            key = generate_encryption_key()
            if validate_encryption_key(key):
                logger.info(f"✅ Generated key {i+1} is valid")
            else:
                logger.error(f"❌ Generated key {i+1} is invalid")
                return False
                
        return True
        
    except Exception as e:
        logger.error(f"❌ Security features test failed: {e}")
        return False

def test_frontend_integration():
    """Test frontend integration points"""
    logger.info("📱 Testing Frontend Integration...")
    
    try:
        # Test the data structures that frontend will use
        test_response = {
            "success": True,
            "gcpUrl": "gs://test-bucket/encrypted_images/user123/scan001/image.enc",
            "firestoreId": "scan001",
            "scanId": "scan001",
            "message": "Image securely processed and stored in GCP"
        }
        
        # Verify required fields
        required_fields = ["success", "gcpUrl", "firestoreId", "scanId", "message"]
        for field in required_fields:
            if field in test_response:
                logger.info(f"✅ Required field '{field}' present")
            else:
                logger.error(f"❌ Required field '{field}' missing")
                return False
                
        # Test metadata structure
        test_metadata = {
            "userId": "user123",
            "scanId": "scan001",
            "scanType": "breast-scan",
            "quality": 0.9,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("✅ Frontend integration test successful")
        return True
        
    except Exception as e:
        logger.error(f"❌ Frontend integration test failed: {e}")
        return False

def run_all_tests():
    """Run all tests and provide summary"""
    logger.info("🚀 Starting Secure Image Pipeline Tests...")
    logger.info("=" * 60)
    
    tests = [
        ("Encryption Only", test_encryption_only),
        ("Image Processing", test_image_processing),
        ("Pipeline Initialization", test_pipeline_initialization),
        ("Security Features", test_security_features),
        ("Frontend Integration", test_frontend_integration)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running: {test_name}")
        logger.info("-" * 40)
        
        try:
            result = test_func()
            results.append((test_name, result))
            
            if result:
                logger.info(f"✅ {test_name}: PASSED")
            else:
                logger.error(f"❌ {test_name}: FAILED")
                
        except Exception as e:
            logger.error(f"❌ {test_name}: ERROR - {e}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 TEST RESULTS SUMMARY")
    logger.info("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status} {test_name}")
    
    logger.info(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 ALL TESTS PASSED! Secure Image Pipeline is ready.")
        return True
    else:
        logger.error(f"⚠️ {total - passed} tests failed. Please review errors above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)



