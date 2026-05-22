@echo off
title درب - سكرتير خاص فيك 🤖
color 0A

echo ============================================
echo   درب - سكرتير خاص فيك 🤖
echo ============================================
echo.

cd /d "%~dp0backend"

echo [1/2] التحقق من الحزم...
if not exist "node_modules" (
    echo   الحزم مو مثبتة. جاري التثبيت...
    call npm install
    if errorlevel 1 (
        echo ❌ فشل تثبيت الحزم!
        pause
        exit /b
    )
    echo ✅ تم التثبيت
) else (
    echo ✅ الحزم موجودة
)

echo.
echo [2/2] تشغيل السيرفر...
echo.
echo الباك إند: http://localhost:5000
echo تطبيق الويب: http://localhost:3000
echo ============================================
echo.
echo ملاحظة: عشان تشغل تطبيق الويب،
cmd /c start cmd /k "cd /d "%~dp0web" && npm start"
echo.

npm start

pause
