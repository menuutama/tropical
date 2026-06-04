@echo off
title Uninstall EventMediaOffline Protocol

set APP_FOLDER=%LOCALAPPDATA%\EventMediaOffline
set PROTOCOL=eventmedia

echo Removing EventMediaOffline...
echo.

reg delete "HKCU\Software\Classes\%PROTOCOL%" /f
rmdir /S /Q "%APP_FOLDER%"

echo.
echo DONE.
pause
