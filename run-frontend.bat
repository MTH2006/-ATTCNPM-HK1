@echo off
title HotelBooking Frontend Server
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-frontend.ps1" %*
pause
