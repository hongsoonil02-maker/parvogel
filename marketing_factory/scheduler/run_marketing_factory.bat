@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo =======================================================
echo [PARVOGEL MARKETING FACTORY] Starting Automation Run
echo Current Time: %DATE% %TIME%
echo =======================================================

python core\marketing_master.py >> output\factory_daily.log 2>&1

echo Completed with Exit Code: %ERRORLEVEL%
