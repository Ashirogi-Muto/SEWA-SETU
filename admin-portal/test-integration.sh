#!/bin/bash
# Integration Test Script for Admin Portal Backend Connection

echo "🚀 Testing Admin Portal Backend Integration..."
echo ""

# Test if backend is running
echo "1. Testing Backend Connection..."
curl -f http://localhost:8000/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend is running on port 8000"
else
    echo "❌ Backend is NOT running on port 8000"
    echo "   Please start backend: cd backend && python -m uvicorn main:app --reload --port 8000"
    exit 1
fi

# Test dashboard endpoint
echo ""
echo "2. Testing Dashboard API..."
curl -f http://localhost:8000/api/dashboard > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Dashboard API working"
else
    echo "❌ Dashboard API not responding"
fi

# Test analytics endpoint
echo ""
echo "3. Testing Analytics API..."
curl -f http://localhost:8000/api/analytics > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Analytics API working"
else
    echo "❌ Analytics API not responding"
fi

# Test reports endpoint
echo ""
echo "4. Testing Reports API..."
curl -f "http://localhost:8000/api/reports/all?limit=5" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Reports API working"
else
    echo "❌ Reports API not responding"
fi

# Check if admin portal files exist
echo ""
echo "5. Checking Admin Portal Files..."
if [ -f "src/lib/api.ts" ]; then
    echo "✅ API file exists"
else
    echo "❌ API file missing"
fi

if [ -f ".env" ]; then
    echo "✅ Environment file exists"
else
    echo "❌ Environment file missing"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Update .env file with correct API_SECRET_KEY"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "4. Create admin user via backend API"
echo "5. Access admin portal at http://localhost:8080"
echo ""
echo "Integration Test Complete! 🎉"