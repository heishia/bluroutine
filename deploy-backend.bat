@echo off
echo ========================================
echo Bluroutine 백엔드 배포 스크립트
echo ========================================

echo.
echo 1. 백엔드 의존성 설치 중...
cd backend
call pip install -r requirements.txt

echo.
echo 2. 백엔드 서버 시작 중...
echo 배포용 서버가 시작됩니다.
echo 서버 주소: http://0.0.0.0:8000
echo.

python production-main.py

pause



