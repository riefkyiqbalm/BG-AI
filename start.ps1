#!/usr/bin/env pwsh
# Quick start script for BG-AI (Windows PowerShell)
# Starts backend and frontend in parallel

Write-Host "`n" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " BG-AI - Full Stack Startup" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "`nPrerequisites:" -ForegroundColor Yellow
Write-Host " 1. LM Studio running with Qwen3-4B loaded and server started"
Write-Host " 2. Python 3.8+ installed"
Write-Host " 3. Node.js + npm installed`n"

# Check if running from project root
if (-not (Test-Path "log\main.py")) {
    Write-Host "ERROR: Could not find log\main.py" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "ui\package.json")) {
    Write-Host "ERROR: Could not find ui\package.json" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install Python dependencies if needed
Write-Host "[1/4] Checking Python dependencies..." -ForegroundColor Cyan
Set-Location log
if (-not (Test-Path "..\venv")) {
    Write-Host "Installing Python packages..." -ForegroundColor Yellow
    pip install -r requirements.txt
} else {
    Write-Host "Python dependencies already installed" -ForegroundColor Green
}
Set-Location ..\

# Install Node dependencies if needed
Write-Host "[2/4] Checking Node dependencies..." -ForegroundColor Cyan
Set-Location ui
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node packages..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Node dependencies already installed" -ForegroundColor Green
}
Set-Location ..\

Write-Host "`n[3/4] Starting Flask Backend (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location log; python main.py"

Start-Sleep -Seconds 3

Write-Host "[4/4] Starting Next.js Frontend (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location ui; npm run dev"

Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host " Startup Sequence Complete!" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "`n Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host " Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host " LM Studio: http://localhost:1234" -ForegroundColor Cyan
Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host "`nYou can now access the application in your browser at http://localhost:3000" -ForegroundColor Yellow
Write-Host "Both backend and frontend windows will remain open for monitoring logs.`n" -ForegroundColor Yellow
