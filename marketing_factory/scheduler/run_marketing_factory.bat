@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo =======================================================
echo [PARVOGEL MARKETING FACTORY] Starting Automation Run
echo Current Time: %DATE% %TIME%
echo =======================================================

REM GitHub Actions와 중복 방지: ledger에 오늘 날짜 있으면 force 없이 종료됨
python core\marketing_master.py >> output\factory_daily.log 2>&1

echo Completed with Exit Code: %ERRORLEVEL%
