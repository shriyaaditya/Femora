#!/usr/bin/env python3
"""
Startup script for the Mora chatbot backend server.
This script handles environment setup and server startup.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required packages are installed."""
    required_packages = [
        ('flask', 'flask'),
        ('python-dotenv', 'dotenv'),
        ('firebase-admin', 'firebase_admin'),
        ('langchain', 'langchain'),
        ('langchain-google-genai', 'langchain_google_genai'),
        ('langchain-community', 'langchain_community'),
        ('langchain-text-splitters', 'langchain_text_splitters'),
        ('langchain-chroma', 'langchain_chroma'),
        ('chromadb', 'chromadb'),
        ('google-generativeai', 'google.generativeai')
    ]
    
    missing_packages = []
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nInstall them with: pip install -r requirements.txt")
        sys.exit(1)
    
    print("✅ All required packages are installed")

def check_environment():
    """Check if required environment variables are set."""
    required_vars = ['GOOGLE_API_KEY', 'GOOGLE_APPLICATION_CREDENTIALS']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set them in your .env file")
        sys.exit(1)
    
    print("✅ Environment variables are configured")

def start_server():
    """Start the Mora chatbot server."""
    print("\n🚀 Starting Mora chatbot server...")
    print("📍 Server will run on: http://localhost:5002")
    print("📱 Connect your React Native app to this URL")
    print("⏹️  Press Ctrl+C to stop the server\n")
    
    try:
        # Import and run the main Flask app
        from main import app
        app.run(host="0.0.0.0", port=5002, debug=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main startup function."""
    print("🐷 Mora Chatbot Backend Startup")
    print("=" * 40)
    
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Run checks
    check_python_version()
    check_dependencies()
    check_environment()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()
