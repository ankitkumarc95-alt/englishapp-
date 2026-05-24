@echo off
title Launching English Academy 2.0
cd /d "%~dp0"

:: NIche wali line mein apni key daalni hai
set GEMINI_API_KEY=AIzaSyC1dpoqllL1L0RekOt1y2oyuLXIXHUxpIo

IF NOT EXIST "node_modules" (
    echo ==================================================
    echo  First time setup: Installing required files...
    echo ==================================================
    call npm install
)

echo ==================================================
echo   STARTING YOUR APPLICATION...
echo ==================================================

start chrome "http://localhost:3000"
call npm run dev