@echo off
REM Build api-enhanced sidecar for Tauri
REM Requires: Node.js, npm, and network access to download pkg base binary

setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0.."
set "API_DIR=%PROJECT_DIR%\vendor\api-enhanced"
set "OUTPUT_DIR=%PROJECT_DIR%\src-tauri\binaries"
set "OUTPUT_FILE=%OUTPUT_DIR%\api-enhanced-x86_64-pc-windows-msvc.exe"

echo Building api-enhanced sidecar...
echo API directory: %API_DIR%
echo Output: %OUTPUT_FILE%

REM Check if pkg is installed
npm list -g @yao-pkg/pkg >nul 2>&1
if errorlevel 1 (
    echo Installing @yao-pkg/pkg...
    npm install -g @yao-pkg/pkg
)

REM Create output directory
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Build sidecar
cd /d "%API_DIR%"
call npx pkg . -t node22-win-x64 --fallback-to-source --out-path "%OUTPUT_DIR%"

REM Rename to Tauri sidecar format
if exist "%API_DIR%\api-enhanced.exe" (
    move /y "%API_DIR%\api-enhanced.exe" "%OUTPUT_FILE%"
    echo.
    echo Sidecar built successfully: %OUTPUT_FILE%
    dir /h "%OUTPUT_FILE%"
) else (
    echo.
    echo Build failed: output file not found
    exit /b 1
)
