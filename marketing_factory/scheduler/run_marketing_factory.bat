@echo off
chcp 65001 >nul
cd /d "%~dp0\..\.."

set "LOG_FILE=%~dp0..\output\factory_daily.log"

echo ======================================================= >> "%LOG_FILE%" 2>&1
echo [PARVOGEL LOCAL WORKER - 1A MODE: GITHUB ACTIONS OWNS SHORTS] >> "%LOG_FILE%" 2>&1
echo Current Time: %DATE% %TIME% >> "%LOG_FILE%" 2>&1
echo ======================================================= >> "%LOG_FILE%" 2>&1

set "PYTHON_EXE=C:\Users\master\AppData\Local\Python\bin\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

REM [1/3] Local external shorts folder ingestion watcher
echo [1/3] Scanning external shorts drop folder... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" marketing_factory\core\external_shorts_watcher.py >> "%LOG_FILE%" 2>&1

REM [2/3] Local Playwright Naver Blog Hybrid Queue worker (requires active local Naver session)
echo [2/3] Running local Naver Blog hybrid queue worker... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" marketing_factory\run_local_naver_worker.py >> "%LOG_FILE%" 2>&1

REM NOTE (1A Architecture): YouTube Shorts / Instagram Reels / TikTok / Facebook / Bluesky
REM are dispatched exclusively by GitHub Actions (.github/workflows/marketing-factory.yml)
REM at 07:00 KST daily to guarantee zero duplicate uploads.

REM [3/3] Refresh local analytics funnel dashboard
echo [3/3] Updating Funnel Dashboard... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" marketing_factory\core\dashboard_service.py >> "%LOG_FILE%" 2>&1

echo ======================================================= >> "%LOG_FILE%" 2>&1
echo [LOCAL WORKER COMPLETE] Exit Code: %ERRORLEVEL% >> "%LOG_FILE%" 2>&1
echo ======================================================= >> "%LOG_FILE%" 2>&1
exit /b 0
