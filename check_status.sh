#!/bin/bash

echo "🔍 Checking Femora Services Status"
echo "=================================="

# Check Backend Status
BACKEND_HOST=${DEV_BACKEND_HOST:-${DEV_BACKEND_HOST:-10.133.147.50}}
BACKEND_PORT=${DEV_BACKEND_PORT:-5002}
echo -n "🤖 Backend (Port ${BACKEND_PORT}): "
if curl -s http://${BACKEND_HOST}:${BACKEND_PORT}/health > /dev/null 2>&1; then
    echo "✅ RUNNING"
    echo "   Health: $(curl -s http://${BACKEND_HOST}:${BACKEND_PORT}/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
    echo "   Streaming: $(curl -s http://${BACKEND_HOST}:${BACKEND_PORT}/health | grep -o '"streaming":[^,]*' | cut -d':' -f2)"
else
    echo "❌ NOT RUNNING"
fi

# Check Frontend Status
FRONTEND_HOST=${DEV_FRONTEND_HOST:-localhost}
FRONTEND_PORT=${DEV_FRONTEND_PORT:-8081}
echo -n "🚀 Frontend (Port ${FRONTEND_PORT}): "
if curl -s http://${FRONTEND_HOST}:${FRONTEND_PORT} > /dev/null 2>&1; then
    echo "✅ RUNNING"
    echo "   URL: http://${FRONTEND_HOST}:${FRONTEND_PORT}"
else
    echo "❌ NOT RUNNING"
fi

# Check Port Usage
echo ""
echo "📊 Port Status:"
echo "   Port ${BACKEND_PORT} (Backend): $(lsof -i:${BACKEND_PORT} > /dev/null 2>&1 && echo "IN USE" || echo "FREE")"
echo "   Port ${FRONTEND_PORT} (Frontend): $(lsof -i:${FRONTEND_PORT} > /dev/null 2>&1 && echo "IN USE" || echo "FREE")"

echo ""
echo "🎯 Quick Commands:"
echo "   Start all: ./start_all.sh"
echo "   Start backend: cd mora && ./start_backend.sh"
echo "   Start frontend: ./start_frontend.sh"
echo "   Check status: ./check_status.sh"
