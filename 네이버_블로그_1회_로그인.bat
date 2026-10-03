@echo off
title Naver Blog Login Setup
cd /d "C:\Users\master\parvogel_landing"
echo ========================================================
echo   [PARVOGEL] Naver Blog 1-Time Login Setup
echo ========================================================
echo.
echo Launching dedicated browser...
echo Please log in to your Naver account in the opened window.
py -u "C:\Users\master\parvogel_landing\scripts\login_and_publish_blog.py"
echo.
pause
