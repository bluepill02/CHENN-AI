Write-Host "🚀 Starting Chennai Community App Setup for Jules..." -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 2. Install Dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# 3. Setup Environment Variables
Write-Host "`n🔑 Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "⚠️  Created .env.local from template." -ForegroundColor Yellow
        Write-Host "👉 PLEASE UPDATE .env.local WITH REAL API KEYS!" -ForegroundColor Magenta
    } else {
        Write-Host "❌ .env.example not found. Cannot create config." -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env.local already exists. Skipping." -ForegroundColor Green
}

# 4. Final Instructions
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "To start the app, run:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Green
