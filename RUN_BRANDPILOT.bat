@echo off
pushd "%~dp0"
title BrandPilot AI Launcher
echo ===================================================
echo           BrandPilot AI - Central Intelligence
echo ===================================================
echo.

:: Verify Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: Install dependencies if not already installed
if not exist "node_modules" (
    echo [SYSTEM] Installing project dependencies...
    call npm install
)

echo [SYSTEM] Starting Backend API (Port 5005)...
start "BrandPilot - Backend (5005)" cmd /k "npm run server"

echo [SYSTEM] Starting Frontend Server (Port 3200)...
start "BrandPilot - Frontend (3200)" cmd /k "npm run dev"

echo.
echo ===================================================
echo  Frontend UI : http://localhost:3200
echo  Backend API : http://localhost:5005
echo ===================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3200
exit
