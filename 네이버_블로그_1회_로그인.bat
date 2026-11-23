@echo off
chcp 65001 >nul
title ParvoGel Naver Blog 1-Time Login & Auto Publish
cd /d "C:\Users\master\parvogel_landing"
echo ========================================================
echo   [PARVOGEL] Naver Blog 1-Time Login Setup + Publish
echo ========================================================
echo.
set "PYTHON_EXE=C:\Users\master\AppData\Local\Python\bin\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

echo [1/2] Launching Naver login window (Keep me signed in)...
"%PYTHON_EXE%" -u "C:\Users\master\parvogel_landing\marketing_factory\setup_naver_session.py"
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Login was not completed.
    pause
    exit /b 1
)
echo.
echo [2/2] Publishing #1 purified B2C post from queue...
"%PYTHON_EXE%" -u "C:\Users\master\parvogel_landing\marketing_factory\run_local_naver_worker.py"
echo.
pause
