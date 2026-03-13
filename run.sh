#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect OS
case "$(uname -s)" in
    Darwin) OS="darwin" ;;
    Linux)  OS="linux" ;;
    *)
        echo "❌ Unsupported OS: $(uname -s)"
        echo "   Supported: macOS (darwin), Linux"
        exit 1
        ;;
esac

# Detect architecture
case "$(uname -m)" in
    arm64|aarch64) ARCH="arm64" ;;
    x86_64|amd64)  ARCH="amd64" ;;
    *)
        echo "❌ Unsupported architecture: $(uname -m)"
        echo "   Supported: arm64/aarch64, x86_64/amd64"
        exit 1
        ;;
esac

BINARY="$SCRIPT_DIR/bin/tsgo-${OS}-${ARCH}"

if [ ! -f "$BINARY" ]; then
    echo "❌ Binary not found: $BINARY"
    echo "   Available binaries:"
    ls -1 "$SCRIPT_DIR/bin/" 2>/dev/null || echo "   (none)"
    exit 1
fi

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  SolidJS × TypeScript-Go: stable/mutator/invalidates   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Platform: ${OS}/${ARCH}"
echo "Binary:   $(basename "$BINARY")"
echo ""

if [ "${1:-}" = "--declaration-emit" ]; then
    echo "Mode: Declaration Emit (.d.ts output)"
    echo "─────────────────────────────────────"
    echo ""
    mkdir -p "$SCRIPT_DIR/out"
    "$BINARY" --project "$SCRIPT_DIR/tsconfig.json" \
        --noEmit false \
        --declaration \
        --emitDeclarationOnly \
        --outDir "$SCRIPT_DIR/out"
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo ""
        echo "✅ Declaration emit succeeded!"
        echo ""
        echo "Generated .d.ts files:"
        find "$SCRIPT_DIR/out" -name '*.d.ts' -exec echo "  {}" \;
        echo ""
        echo "Inspect output:"
        echo "  cat out/examples/06-declaration-emit.d.ts"
    else
        echo ""
        echo "❌ Declaration emit failed (exit code: $EXIT_CODE)"
    fi
    exit $EXIT_CODE
else
    echo "Mode: Type Check (noEmit)"
    echo "─────────────────────────"
    echo ""
    "$BINARY" --project "$SCRIPT_DIR/tsconfig.json" --noEmit
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo ""
        echo "✅ All examples type-check successfully!"
        echo "   No errors — stable/mutator/invalidates narrowing works."
        echo ""
        echo "Try declaration emit mode:"
        echo "  ./run.sh --declaration-emit"
    else
        echo ""
        echo "⚠️  Type check completed with errors (exit code: $EXIT_CODE)"
        echo "   Some @ts-expect-error lines demonstrate expected failures."
    fi
    exit $EXIT_CODE
fi
