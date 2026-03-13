#!/bin/bash
set -e

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
    x86_64|amd64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

BINARY="bin/tsgo-${OS}-${ARCH}"

if [ ! -f "$BINARY" ]; then
    echo "Binary not found: $BINARY"
    echo "Available binaries:"
    ls -1 bin/
    exit 1
fi

echo "======================================================"
echo "  SolidJS x TypeScript-Go: Type Check with tsgo"
echo "======================================================"
echo ""
echo "Platform: ${OS}/${ARCH}"
echo "Binary:   $(basename $BINARY)"
echo ""

OUTPUT=$(./"$BINARY" --project tsconfig.json --noEmit 2>&1) || true

if [ -z "$OUTPUT" ]; then
    echo "All source files type-check successfully with tsgo."
    echo "stable/mutator/invalidates narrowing works."
    echo ""
    echo "Run the app: npm run dev"
else
    echo "$OUTPUT"
fi
