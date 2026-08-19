#!/bin/bash
# Build api-enhanced sidecar for Tauri
# Requires: Node.js, npm, and network access to download pkg base binary

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_DIR/vendor/api-enhanced"
OUTPUT_DIR="$PROJECT_DIR/src-tauri/binaries"
OUTPUT_FILE="$OUTPUT_DIR/api-enhanced-x86_64-pc-windows-msvc.exe"

echo "Building api-enhanced sidecar..."
echo "API directory: $API_DIR"
echo "Output: $OUTPUT_FILE"

# Check if pkg is installed
if ! npm list -g @yao-pkg/pkg > /dev/null 2>&1; then
    echo "Installing @yao-pkg/pkg..."
    npm install -g @yao-pkg/pkg
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Build sidecar
cd "$API_DIR"
npx pkg . -t node22-win-x64 --fallback-to-source --out-path "$OUTPUT_DIR"

# Rename to Tauri sidecar format
if [ -f "$API_DIR/api-enhanced.exe" ]; then
    mv "$API_DIR/api-enhanced.exe" "$OUTPUT_FILE"
    echo "✓ Sidecar built: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
else
    echo "✗ Build failed: output file not found"
    exit 1
fi
