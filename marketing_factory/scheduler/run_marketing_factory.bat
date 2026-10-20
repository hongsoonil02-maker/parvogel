@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo =======================================================
echo [PARVOGEL MARKETING FACTORY] Starting Automation Run
echo Current Time: %DATE% %TIME%
echo =======================================================

set "PYTHON_EXE=C:\Users\master\AppData\Local\Python\bin\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

"%PYTHON_EXE%" core\marketing_master.py >> output\factory_daily.log 2>&1

echo Completed with Exit Code: %ERRORLEVEL%
