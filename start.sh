#!/usr/bin/env bash

# Navigate to script directory
cd "$(dirname "$0")"

echo "=========================================================="
echo "  RELIC: The Lost World"
echo "  Unix/Linux/macOS Auto-Launcher"
echo "=========================================================="
echo ""

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js $(node -v) detected."

# 2. Check for dependencies
if [ ! -d "node_modules" ]; then
    echo "[INFO] First time launch. Installing dependencies via npm install..."
    npm install
fi

# 3. Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v open &> /dev/null; then
    open "http://localhost:3000" &
fi

# 4. Start dev server
echo "[INFO] Starting game server..."
npm run dev
