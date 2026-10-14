@echo off
title Amar Khoroch - Personal Expense Tracker
echo Starting Amar Khoroch Local Preview...
echo.
start http://localhost:8080
powershell -ExecutionPolicy Bypass -File "%~dp0start-local-server.ps1" -Port 8080
pause
