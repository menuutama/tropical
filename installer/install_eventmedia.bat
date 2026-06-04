@echo off
title Install EventMediaOffline Protocol

set APP_FOLDER=%LOCALAPPDATA%\EventMediaOffline
set EXE_NAME=EventMediaOffline.exe
set PROTOCOL=eventmedia

echo Installing EventMediaOffline...
echo.

if not exist "%APP_FOLDER%" (
  mkdir "%APP_FOLDER%"
)

copy /Y "%~dp0%EXE_NAME%" "%APP_FOLDER%\%EXE_NAME%"

reg add "HKCU\Software\Classes\%PROTOCOL%" /ve /d "URL:EventMediaOffline Protocol" /f
reg add "HKCU\Software\Classes\%PROTOCOL%" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\%PROTOCOL%\shell" /f
reg add "HKCU\Software\Classes\%PROTOCOL%\shell\open" /f
reg add "HKCU\Software\Classes\%PROTOCOL%\shell\open\command" /ve /d "\"%APP_FOLDER%\%EXE_NAME%\" \"%%1\"" /f

echo.
echo DONE.
echo eventmedia://start registered.
echo.
pause
