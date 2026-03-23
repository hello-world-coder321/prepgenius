@echo off
echo Starting PrepGenius Server...
node server.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo ----------------------------------------
    echo ❌ The server crashed with an error. 
    echo Please read the error message above.
    echo ----------------------------------------
    pause
) else (
    echo Server closed normally.
    pause
)
