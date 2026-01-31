@echo off
REM GoBeauty Full System Startup - Windows Batch
REM Double-click this file to start all services

cd /d "c:\Users\lucky\Desktop\Downloads\GoBeauty-Complete-Audited(1)\WebApp"

echo.
echo ================================
echo GoBeauty Full System Startup
echo ================================
echo.

REM Start PowerShell with the startup script
powershell -NoProfile -ExecutionPolicy Bypass -File ".\start-all.ps1"

pause
