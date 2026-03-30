@echo off
REM Quick start script for BG-AI (Windows PowerShell)
REM Starts backend and frontend in parallel

echo.
echo ====================================================================
echo  BG-AI - Full Stack Startup
echo ====================================================================
echo.
echo Prerequisites:
echo  1. LM Studio running with Qwen3-4B loaded and server started
echo  2. Python 3.8+ installed
echo  3. Node.js + npm installed
echo.
echo Starting backend and frontend...
echo.

REM Check if running from project root
if not exist "log\main.py" (
    echo ERROR: Could not find log\main.py
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "ui\package.json" (
    echo ERROR: Could not find ui\package.json
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Install dependencies if needed
echo [1/4] Checking Python dependencies...
cd log
if not exist "..\venv" (
    echo Installing Python packages...
    pip install -r requirements.txt
) else (
    echo Python dependencies already installed
)
cd ..\

REM Install Node dependencies if needed
echo [2/4] Checking Node dependencies...
cd ui
if not exist "node_modules" (
    echo Installing Node packages...
    npm install
) else (
    echo Node dependencies already installed
)
cd ..\

echo.
echo [3/4] Starting Flask Backend (Port 5000)...
start cmd /k "cd log && python main.py"

timeout /t 3 /nobreak

echo [4/4] Starting Next.js Frontend (Port 3000)...
start cmd /k "cd ui && npm run dev"

echo.
echo ====================================================================
echo  Startup Sequence Complete!
echo  
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo  LM Studio: http://localhost:1234
echo ====================================================================
echo.
pause
