@echo off
chcp 65001 >nul
title رفع مشروع الويب إلى GitHub
cd /d "%~dp0"

echo =======================================================
echo    مساعد رفع نسخة الويب إلى GitHub و GitHub Pages
echo =======================================================
echo.

:: فحص ما إذا كان Git مثبت
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ تنبيه: Git غير مثبت على جهازك أو غير مضاف لـ PATH.
    echo يمكنك تنزيل Git من: https://git-scm.com/
    pause
    exit /b 1
)

:: تهيئة مستودع Git إذا لم يكن موجوداً
if not exist ".git" (
    echo جاري تهيئة مستودع Git محلي...
    git init
    git branch -M main
)

:: إضافة وحفظ التغييرات
echo جاري تحضير الملفات وحفظها...
git add .
git commit -m "SchoolSystem Web - Production Ready Table Layout"

:: التحقق من وجود مستودع بعيد
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo -------------------------------------------------------
    echo  يرجى نسخ رابط مستودع GitHub الخاص بك (HTTPS URL)
    echo  مثال: https://github.com/YourUsername/SchoolSystem-Web.git
    echo -------------------------------------------------------
    set /p REPO_URL="ضع رابط المستودع هنا ثم اضغط Enter: "
    if defined REPO_URL (
        git remote add origin %REPO_URL%
    ) else (
        echo لم يتم إدخال رابط. تم إلغاء العملية.
        pause
        exit /b 1
    )
)

echo.
echo جاري الرفع إلى GitHub (Push to main)...
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo  ✅ تم الرفع إلى GitHub بنجاح!
    echo.
    echo  لتفعيل الرابط العام المجاني (GitHub Pages):
    echo  1. افتح مستودعك على GitHub في المتصفح.
    echo  2. اذهب إلى Settings -> Pages.
    echo  3. في قسم (Build and deployment) اختر (Source: GitHub Actions).
    echo  4. سيعمل الرابط تلقائياً بعد دقيقة واحدة لكل الأجهزة!
    echo =======================================================
) else (
    echo.
    echo ❌ تعذر الرفع التلقائي. تأكد من صحة الرابط وصلاحيات الحساب في GitHub.
)

pause
