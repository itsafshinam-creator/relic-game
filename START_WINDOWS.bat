@echo off
title RELIC - Launcher
cd /d "%~dp0"

echo ==========================================================
echo   RELIC: The Lost World - Windows Launcher
echo ==========================================================
echo.

where node >nul 2>&1
if errorlevel 1 goto nonode

for /f "tokens=*" %%v in ('node -v') do echo [OK] Node.js %%v

if exist "node_modules\vite" goto deps_ok
echo [INFO] First run: installing packages, please wait...
call npm install --no-audit
if errorlevel 1 goto installfail

:deps_ok
echo.
echo ==========================================================
echo   Starting game at http://localhost:3000
echo   Keep this window open while playing.
echo ==========================================================
echo.
start "" "http://localhost:3000"
call npm run dev
echo.
echo [INFO] Server stopped.
pause
exit /b 0

:nonode
echo [ERROR] Node.js was not found. Install the LTS version from https://nodejs.org/
start https://nodejs.org/
pause
exit /b 1

:installfail
echo [ERROR] npm install failed. See the messages above.
pause
exit /b 1
