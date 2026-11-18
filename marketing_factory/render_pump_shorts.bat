@echo off
chcp 65001 > nul
echo [PARVOGEL SHORTS RENDERER] Starting 1080x1920 Clinical Shorts Generation...
cd /d "c:\Users\master\parvogel_landing"
python scripts\generate_pump_guide_shorts.py
echo.
echo [DONE] Video rendering finished.
pause
