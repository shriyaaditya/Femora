#!/bin/bash

# Authorization Testing Script for Femora App
# This script runs comprehensive authorization tests

echo "🔐 Femora Authorization Testing Suite"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Femora directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: Femora directory with package.json"
    exit 1
fi

echo "✅ Found Femora project directory"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    echo "   Please install Python 3 and try again"
    exit 1
fi

echo "✅ Python 3 is available"
echo ""

# Check if testing script exists
if [ ! -f "scripts/test_authorization.py" ]; then
    echo "❌ Error: Testing script not found"
    echo "   Expected: scripts/test_authorization.py"
    echo "   Please ensure the testing script exists"
    exit 1
fi

echo "✅ Testing script found"
echo ""

# Run the authorization tests
echo "🚀 Starting Authorization Tests..."
echo ""

cd scripts
python3 test_authorization.py
TEST_EXIT_CODE=$?

echo ""
echo "======================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 All tests completed successfully!"
    echo "✅ Your authorization system is ready"
else
    echo "⚠️ Some tests failed"
    echo "📄 Check the test report for details"
fi

echo ""
echo "📱 Next Steps:"
echo "   1. Review the test report above"
echo "   2. Follow the manual testing guide"
echo "   3. Test on actual devices"
echo "   4. Verify user experience"

exit $TEST_EXIT_CODE
