#!/bin/bash

# =============================================================================
# FEMORA - Python Dependencies Installation Script
# =============================================================================

echo "🚀 Installing Femora Python dependencies..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Python $PYTHON_VERSION detected. Python $REQUIRED_VERSION+ is required."
    exit 1
fi

echo "✅ Python $PYTHON_VERSION detected"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ All dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! To activate the environment in the future:"
    echo "   source venv/bin/activate"
    echo ""
    echo "📚 Available backends:"
    echo "   - Mora AI (Flask): python mora/main.py"
    echo "   - FastAPI Backend: python -m uvicorn mora.main_fastapi:app --reload"
    echo "   - Image Pipeline: python -m uvicorn backend.secure_image_pipeline:app --reload"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
