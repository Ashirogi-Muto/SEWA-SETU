# Integration Test Script for Admin Portal Backend Connection

Write-Host "🚀 Testing Admin Portal Backend Integration..." -ForegroundColor Green
Write-Host ""

# Test if backend is running
Write-Host "1. Testing Backend Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running on port 8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is NOT running on port 8000" -ForegroundColor Red
    Write-Host "   Please start backend: cd backend && python -m uvicorn main:app --reload --port 8000" -ForegroundColor Yellow
    exit 1
}

# Test dashboard endpoint
Write-Host ""
Write-Host "2. Testing Dashboard API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/dashboard" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Dashboard API working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Dashboard API not responding" -ForegroundColor Red
}

# Test analytics endpoint
Write-Host ""
Write-Host "3. Testing Analytics API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/analytics" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Analytics API working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Analytics API not responding" -ForegroundColor Red
}

# Test reports endpoint
Write-Host ""
Write-Host "4. Testing Reports API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/reports/all?limit=5" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Reports API working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Reports API not responding" -ForegroundColor Red
}

# Check if admin portal files exist
Write-Host ""
Write-Host "5. Checking Admin Portal Files..." -ForegroundColor Yellow
if (Test-Path "src/lib/api.ts") {
    Write-Host "✅ API file exists" -ForegroundColor Green
} else {
    Write-Host "❌ API file missing" -ForegroundColor Red
}

if (Test-Path ".env") {
    Write-Host "✅ Environment file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Environment file missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with correct API_SECRET_KEY"
Write-Host "2. Run: npm install"
Write-Host "3. Run: npm run dev"
Write-Host "4. Create admin user via backend API"
Write-Host "5. Access admin portal at http://localhost:8080"
Write-Host ""
Write-Host "Integration Test Complete! 🎉" -ForegroundColor Green