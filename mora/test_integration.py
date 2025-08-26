#!/usr/bin/env python3
"""
Test script for the Mora chatbot integration.
This script tests the backend API endpoints and simulates frontend communication.
"""

import requests
import json
import time
from datetime import datetime

def test_health_endpoint(base_url):
    """Test the health check endpoint."""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed: {health_data['status']}")
            print(f"   LLM Status: {health_data.get('llm_status', 'unknown')}")
            print(f"   Retriever Status: {health_data.get('retriever_status', 'unknown')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_chat_endpoint(base_url):
    """Test the chat endpoint."""
    print("\n💬 Testing chat endpoint...")
    try:
        # Test data
        test_message = {
            "input": "Hello! Can you introduce yourself?",
            "session_id": f"test_session_{int(time.time())}"
        }
        
        response = requests.post(
            f"{base_url}/chat",
            json=test_message,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            chat_data = response.json()
            print(f"✅ Chat test passed!")
            print(f"   Response: {chat_data['response'][:100]}...")
            return True
        else:
            print(f"❌ Chat test failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Chat test error: {e}")
        return False

def test_error_handling(base_url):
    """Test error handling with invalid requests."""
    print("\n⚠️  Testing error handling...")
    
    # Test missing input
    try:
        response = requests.post(
            f"{base_url}/chat",
            json={"session_id": "test_session"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 400:
            print("✅ Missing input error handled correctly")
        else:
            print(f"❌ Expected 400 error, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
    
    # Test missing session_id
    try:
        response = requests.post(
            f"{base_url}/chat",
            json={"input": "Hello"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 400:
            print("✅ Missing session_id error handled correctly")
        else:
            print(f"❌ Expected 400 error, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")

def run_integration_tests():
    """Run all integration tests."""
    base_url = "http://localhost:5002"
    
    print("🧪 Mora Chatbot Integration Tests")
    print("=" * 50)
    print(f"📍 Testing backend at: {base_url}")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test health endpoint
    health_ok = test_health_endpoint(base_url)
    
    if not health_ok:
        print("\n❌ Health check failed. Backend may not be running.")
        print("   Make sure to start the backend with: python main.py")
        return False
    
    # Test chat endpoint
    chat_ok = test_chat_endpoint(base_url)
    
    # Test error handling
    test_error_handling(base_url)
    
    # Summary
    print("\n" + "=" * 50)
    if health_ok and chat_ok:
        print("🎉 All tests passed! Mora chatbot is ready to use.")
        print("📱 Your React Native app should now be able to connect.")
        return True
    else:
        print("❌ Some tests failed. Check the backend logs for details.")
        return False

if __name__ == "__main__":
    try:
        success = run_integration_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n👋 Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        exit(1)
