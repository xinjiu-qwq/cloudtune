@echo off
REM Build the api-enhanced sidecar binary for Tauri (Windows x64).
REM Requires: Node.js 18+ and network access (pkg fetches a patched Node.js
REM base binary from GitHub releases on first run, cached in %%USERPROFILE%%\.pkg-cache).

setlocal

set "PROJECT_DIR=%~dp0.."
set "API_DIR=%PROJECT_DIR%\vendor\api-enhanced"
set "OUTPUT_DIR=%PROJECT_DIR%\src-tauri\binaries"
set "TARGET=%OUTPUT_DIR%\api-enhanced-x86_64-pc-windows-msvc.exe"

echo Building api-enhanced sidecar...
echo   source: %API_DIR%
echo   target: %TARGET%

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
cd /d "%API_DIR%"

REM pkg output file is named after the package.json bin name: api.exe
call npx --yes -p @yao-pkg/pkg pkg . -t node22-win-x64 --fallback-to-source --out-path "%OUTPUT_DIR%"

if exist "%API_DIR%\api.exe" (
    move /y "%API_DIR%\api.exe" "%TARGET%" >nul
    echo Sidecar built: %TARGET%
    dir "%TARGET%" | findstr /i "api-enhanced"
) else (
    echo Build failed: api.exe not found >&2
    exit /b 1
)
