@echo off
title CaelumOS Native Desktop & Runtime
echo ================================================================
echo ⚡ Launching CaelumOS Native Desktop & Infrastructure Runtime
echo ================================================================

:: Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to run CaelumOS Runtime.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Start the native infrastructure runtime daemon in background
echo [1/2] Starting CaelumOS Infrastructure Daemon on 127.0.0.1:48721...
start "CaelumOS Runtime Daemon" /min node desktop-agent/src/index.js

:: Wait 1 second for daemon socket readiness
timeout /t 1 /nobreak >nul

echo [2/2] Opening CaelumOS Desktop Environment...
echo ----------------------------------------------------------------
echo ✓ Docker Engine Detection:   Automatic
echo ✓ Kubernetes Context:        Automatic
echo ✓ Git, Terraform, AWS, Azure: Automatic
echo ----------------------------------------------------------------
echo Starting CaelumOS frontend on http://localhost:3000/os ...

cd frontend
npm run dev
