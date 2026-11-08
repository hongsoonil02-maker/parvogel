@echo off
chcp 65001 > nul
setlocal
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"

echo ========================================================
echo   PARVOGEL Multi-Channel Marketing Factory Runner
echo ========================================================
echo Working Dir: %CD%
echo.
echo [1/4] Generating Shorts Scripts and Blog Guides...
node scripts/marketing/parvogel_content_generator.cjs
echo.
echo [2/4] Running Marketing Master Content Packager...
python scripts/marketing/parvogel_marketing_master.py
echo.
echo [3/4] Running Parvogel Marketing Factory (3 Shorts + 6 Channels)...
python marketing_factory/core/marketing_master.py %*
echo.
echo [4/4] Updating Viral Funnel Dashboard...
python marketing_factory/core/dashboard_service.py
echo.
echo ========================================================
echo   [DONE] Parvogel Marketing Factory Completed!
echo   - Ranking Shorts: marketing_factory\output\ranking_shorts\
echo   - Dashboard: marketing_factory\output\viral_funnel_dashboard.html
echo ========================================================
if "%1"=="--interactive" pause
endlocal
