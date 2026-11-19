@echo off
chcp 65001 >nul
cd /d "%~dp0\..\.."

set "LOG_FILE=%~dp0\..\output\factory_daily.log"

echo ======================================================= >> "%LOG_FILE%" 2>&1
echo [PARVOGEL FULL MARKETING PIPELINE AUTOMATION] >> "%LOG_FILE%" 2>&1
echo Current Time: %DATE% %TIME% >> "%LOG_FILE%" 2>&1
echo ======================================================= >> "%LOG_FILE%" 2>&1

REM 파이썬 경로 확인
set "PYTHON_EXE=C:\Users\master\AppData\Local\Python\bin\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

REM [1/4] 숏폼 대본, 블로그 후기 가이드, 엠오바이오 원고 자동 생성
echo [1/4] Generating Blog/Shorts Drafts... >> "%LOG_FILE%" 2>&1
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    node scripts\marketing\parvogel_content_generator.cjs >> "%LOG_FILE%" 2>&1
)

REM [2/4] 멀티채널 마케팅 콘텐츠 패키징
echo [2/4] Packaging Multi-channel Content... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" scripts\marketing\parvogel_marketing_master.py >> "%LOG_FILE%" 2>&1

REM [2.5/4] 메이커 셀링 외부 숏폼 인입 동기화
echo [2.5/4] Ingesting Maker Selling External Shorts... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" marketing_factory\core\external_shorts_watcher.py >> "%LOG_FILE%" 2>&1

REM [3/4] 파보겔 마케팅 공장 가동 (채널별 맞춤형 리얼 실사 쇼츠 배포: YouTube=시안1 다큐, IG/TikTok=시안2 아바타PiP)
echo [3/4] Executing Real Clinical Channel-Split Video Dispatcher (9:16 + 16:9)... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" marketing_factory\core\custom_video_dispatcher.py --live >> "%LOG_FILE%" 2>&1

REM [3.5/4] 중복 철장 쇼츠 자동 반복 업로드 일시 중지 (2026-11-19 유튜브 중복 페널티 방지)
echo [3.5/4] Skipping legacy repetitive marketing_master.py auto-upload to protect YouTube Shorts algorithm. >> "%LOG_FILE%" 2>&1
REM "%PYTHON_EXE%" marketing_factory\core\marketing_master.py >> "%LOG_FILE%" 2>&1

REM [4/4] 숏폼 전환 퍼널 관제 대시보드 업데이트
echo [4/4] Updating Funnel Dashboard... >> "%LOG_FILE%" 2>&1
"%PYTHON_EXE%" marketing_factory\core\dashboard_service.py >> "%LOG_FILE%" 2>&1

echo ======================================================= >> "%LOG_FILE%" 2>&1
echo [AUTOMATION COMPLETE] Exit Code: %ERRORLEVEL% >> "%LOG_FILE%" 2>&1
echo ======================================================= >> "%LOG_FILE%" 2>&1
