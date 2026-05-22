@echo off
color 0E
echo ============================================
echo   تشخيص درب - وش المشكلة؟
echo ============================================
echo.

echo [1/4] التحقق من وجود Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo   ✅ Node موجود
) else (
    echo   ❌ Node.js مو مثبت! نزله من: https://nodejs.org
)

echo.
echo [2/4] التحقق من وجود npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    npm --version
    echo   ✅ npm موجود
) else (
    echo   ❌ npm مو موجود
)

echo.
echo [3/4] التحقق من مجلد backend...
if exist "%~dp0backend\package.json" (
    echo   ✅ backend\package.json موجود
) else (
    echo   ❌ ما لقيت مجلد backend
)

echo.
echo [4/4] التحقق من تثبيت الحزم...
if exist "%~dp0backend\node_modules" (
    echo   ✅ node_modules موجود (الحزم مثبتة)
) else (
    echo   ❌ الحزم مو مثبتة! اركض:
    echo   cd /d "%~dp0backend"
    echo   npm install
)

echo.
echo ============================================
echo.
if exist "%~dp0backend\node_modules" (
    echo كل شيء تمام ✅ شغل start.bat وبيشتغل
) else (
    echo في مشكلة ⚠️ صلح اللي فوق وارجع جرب
)
echo.
echo ============================================
echo لنشر التطبيق على السحابة (Railway):
echo 1. ارفع المجلد على GitHub
echo 2. افتح railway.com واربط المستودع
echo 3. railsy بيشتغل تلقائياً
echo 4. غير API_BASE في الموبايل لرابط Railway
echo ============================================
pause
