@echo off
chcp 65001 >nul
title بناء نسخة الويب النهائية (Production Build)
cd /d "%~dp0"

echo =======================================================
echo    جاري بناء ملفات نسخة الويب النهائية لنظام المدرسة...
echo =======================================================
echo.

call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ حدث خطأ أثناء البناء! يرجى التأكد من تثبيت الحزم (npm install).
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================================
echo  ✅ تم بناء مجلد (dist) بنجاح تام!
echo.
echo  يمكنك الآن:
echo  1. رفعه مباشرة بسحب مجلد dist إلى: https://app.netlify.com/drop
echo  2. أو رفعه إلى GitHub Pages ليعمل على أي هاتف ومتصفح.
echo =======================================================
echo.

explorer "%~dp0dist"
pause
