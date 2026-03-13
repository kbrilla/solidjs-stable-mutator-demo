#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect OS
case "$(uname -s)" in
    Darwin) OS="darwin" ;;
    Linux)  OS="linux" ;;
    *)
        echo "Unsupported OS: $(uname -s)"
        echo "Supported: macOS (darwin), Linux"
        exit 1
        ;;
esac

# Detect architecture
case "$(uname -m)" in
    arm64|aarch64) ARCH="arm64" ;;
    x86_64|amd64)  ARCH="amd64" ;;
    *)
        echo "Unsupported architecture: $(uname -m)"
        echo "Supported: arm64/aarch64, x86_64/amd64"
        exit 1
        ;;
esac

BINARY="$SCRIPT_DIR/bin/tsgo-${OS}-${ARCH}"

if [ ! -f "$BINARY" ]; then
    echo "Binary not found: $BINARY"
    echo ""
    echo "Available binaries:"
    ls -1 "$SCRIPT_DIR/bin/" 2>/dev/null || echo "  (none)"
    echo ""
    echo "You may need to build from source. See README.md"
    exit 1
fi

echo ""
echo "  SolidJS x TypeScript-Go: stable/mutator/invalidates"
echo "  ==================================================="
echo ""
echo "Platform: ${OS}/${ARCH}"
echo "Binary:   $(basename "$BINARY")"
echo ""

if [ "${1:-}" = "--declaration-emit" ]; then
    echo "Mode: Declaration Emit (.d.ts output)"
    echo "--------------------------------------"
    echo ""

    rm -rf "$SCRIPT_DIR/out"
    "$BINARY" --project "$SCRIPT_DIR/tsconfig.json" \
        --declaration \
        --emitDeclarationOnly \
        --outDir "$SCRIPT_DIR/out" 2>&1 || true

    echo ""
    if [ -d "$SCRIPT_DIR/out" ] && [ "$(find "$SCRIPT_DIR/out" -name '*.d.ts' 2>/dev/null | head -1)" ]; then
        echo "Declaration emit succeeded!"
        echo ""
        echo "Generated .d.ts files:"
        find "$SCRIPT_DIR/out" -name '*.d.ts' | sort | sed 's|'"$SCRIPT_DIR/"'|  |'
        echo ""
        echo "Inspect output:"
        echo "  cat out/examples/01-signal-narrowing.d.ts"
    else
        echo "No .d.ts files generated (some files may not have exports)"
    fi
else
    echo "Mode: Type Check (noEmit)"
    echo "-------------------------"
    echo ""

    OUTPUT=$("$BINARY" --project "$SCRIPT_DIR/tsconfig.json" --noEmit 2>&1) || true

    if [ -z "$OUTPUT" ]; then
        echo "All examples type-check successfully!"
        echo "No errors -- stable/mutator/invalidates narrowing works."
        echo ""
        echo "Try declaration emit mode:"
        echo "  ./run.sh --declaration-emit"
    else
        echo "$OUTPUT"
    fi
fi
