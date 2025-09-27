@echo off
echo ========================================
echo Bluroutine 배포용 빌드 시작
echo ========================================

echo.
echo 1. 프론트엔드 빌드 중...
call npm run build

echo.
echo 2. Capacitor 동기화 중...
call npx cap sync android

echo.
echo 3. Android 디버그 APK 빌드 중...
cd android
call gradlew assembleDebug

echo.
echo 4. 빌드 완료!
echo APK 위치: android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo ========================================
echo 배포용 빌드 완료!
echo ========================================
pause



