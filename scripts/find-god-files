#!/bin/bash

# find-god-files - Find large TypeScript/TSX files in the codebase
# Usage: ./find-god-files [line_threshold]
# Default threshold: 250 lines

set -e  # Exit on any error

# Default line threshold
DEFAULT_THRESHOLD=250

# Get threshold from argument or use default
THRESHOLD=${1:-$DEFAULT_THRESHOLD}

# Validate that threshold is a number
if ! [[ "$THRESHOLD" =~ ^[0-9]+$ ]]; then
    echo "Error: Threshold must be a positive integer"
    echo "Usage: $0 [line_threshold]"
    echo "Example: $0 300"
    exit 1
fi

echo "🔍 Finding TypeScript/TSX files with more than $THRESHOLD lines..."
echo "📁 Searching in: $(pwd)"
echo "🚫 Excluding: *.test.*, *.spec.*"
echo ""

# Find .ts and .tsx files, exclude test/spec files, count lines, filter by threshold
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -name "*.test.*" \
    ! -name "*.spec.*" \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./dist/*" \
    ! -path "./build/*" \
    -exec wc -l {} + 2>/dev/null | \
    awk -v threshold="$THRESHOLD" '
    NF > 1 && $1 >= threshold && $2 != "total" { 
        printf "%s 📄 %s lines: %s\n", $1, $1, $2 
    }' | \
    sort -nr | \
    sed 's/^[0-9]* //'

# Count total files found
TOTAL_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -name "*.test.*" \
    ! -name "*.spec.*" \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./dist/*" \
    ! -path "./build/*" | wc -l)

GOD_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -name "*.test.*" \
    ! -name "*.spec.*" \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./dist/*" \
    ! -path "./build/*" \
    -exec wc -l {} + 2>/dev/null | \
    awk -v threshold="$THRESHOLD" 'NF > 1 && $1 >= threshold && $2 != "total" { count++ } END { print count+0 }')

echo ""
echo "📊 Summary:"
echo "   Total TS/TSX files scanned: $TOTAL_FILES"
echo "   Files exceeding $THRESHOLD lines: $GOD_FILES"

if [ "$GOD_FILES" -eq 0 ]; then
    echo "✨ No god files found! Your codebase is well-structured."
else
    echo "⚠️  Consider refactoring files with high line counts for better maintainability."
fi