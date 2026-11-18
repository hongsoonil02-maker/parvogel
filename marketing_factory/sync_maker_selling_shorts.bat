@echo off
chcp 65001 > nul
echo ==========================================================
echo [MAKER SELLING INGESTION] 외부 숏폼 감지 및 배포 큐 동기화
echo ==========================================================
cd /d "c:\Users\master\parvogel_landing"
python marketing_factory\core\external_shorts_watcher.py
echo.
pause
