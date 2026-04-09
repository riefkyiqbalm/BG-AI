@echo off
echo Terminating development servers...

:: Port 3000 (Next.js default)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

:: Port 5000 (Flask default)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a 2>nul

:: Port 5555 (Prisma Studio default)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5555') do taskkill /f /pid %%a 2>nul

echo All services terminated.
pause