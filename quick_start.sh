#!/bin/bash

echo "🚀 Femora Quick Start - Automatic IP Detection & Startup"
echo "========================================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if auto_network_setup.py exists
if [ ! -f "$SCRIPT_DIR/scripts/auto_network_setup.py" ]; then
    echo "❌ Error: auto_network_setup.py not found!"
    echo "Please run this script from the Femora project root directory"
    exit 1
fi

# Run the automatic network setup
echo "🔧 Running automatic network setup..."
cd "$SCRIPT_DIR"
python3 scripts/auto_network_setup.py

# Check if setup was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎯 Starting all services automatically..."
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Start all services using the auto-generated script
    ./start_femora_auto.sh
else
    echo "❌ Network setup failed. Please check the error messages above."
    exit 1
fi

