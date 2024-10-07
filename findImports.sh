#!/bin/bash

# Directory to search
SERVER_DIR="./server"
SRC_PATTERN="src"

# Find all .ts and .js files in the server directory
find "$SERVER_DIR" -type f \( -name "*.ts" -o -name "*.js" \) ! -path "*/node_modules/*" | while read -r file; do
    echo "File: $file"
    # Extract import statements and filter for src imports
    grep -Eo "import.*from\s+['\"]([^'\"]+)['\"]" "$file" | grep "$SRC_PATTERN"
done