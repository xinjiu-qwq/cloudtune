#!/bin/bash
# Build the api-enhanced sidecar binary for Tauri (Windows x64).
# Requires: Node.js 18+ and network access (pkg fetches a patched Node.js
# base binary from GitHub releases on first run, cached in ~/.pkg-cache).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_DIR/vendor/api-enhanced"
OUTPUT_DIR="$PROJECT_DIR/src-tauri/binaries"
TARGET="$OUTPUT_DIR/api-enhanced-x86_64-pc-windows-msvc.exe"

echo "Building api-enhanced sidecar..."
echo "  source: $API_DIR"
echo "  target: $TARGET"

mkdir -p "$OUTPUT_DIR"
cd "$API_DIR"

# pkg output file is named after the package.json bin name: api.exe
npx --yes -p @yao-pkg/pkg pkg . -t node22-win-x64 --fallback-to-source --out-path "$OUTPUT_DIR"

if [ -f "$API_DIR/api.exe" ]; then
    mv "$API_DIR/api.exe" "$TARGET"
    echo "✓ Sidecar built: $TARGET"
    ls -lh "$TARGET"
else
    echo "✗ Build failed: api.exe not found" >&2
    exit 1
fi
