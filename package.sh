#!/bin/bash

# --- SCRIPT DESCRIPTION ---
# This script automates the process of building the frontend,
# collecting required backend files and organizing them into a new
# directory named 'MyFileServer' in the project root.
# This script is designed to run in a Git Bash or other Unix-like shell environment.

# --- SCRIPT SETUP ---
set -e  # Exit if any error occures

MY_FILE_SERVER_DIR="MyFileServer"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

# --- MAIN LOGIC --- #

# 1) Creating MyFileServer folder, Remove old one if already exists
echo ""
echo "Step 1: Preparing $MY_FILE_SERVER_DIR directory..."
if [ -d "$MY_FILE_SERVER_DIR" ]; then
    echo "   Removing existing $MY_FILE_SERVER_DIR..."
    rm -rf "$MY_FILE_SERVER_DIR"
fi

mkdir -p "$MY_FILE_SERVER_DIR/services"
touch "$MY_FILE_SERVER_DIR/.nomedia"

# 2) Navigate to frontend and build
echo ""
echo "Step 2: Navigating to $FRONTEND_DIR and building..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm ci
fi
npm run build

# 3) Move the dist folder to MyFileServer
echo ""
echo "Step 3: Moving the dist folder and rename it as public"
mv "dist" "../$MY_FILE_SERVER_DIR/public"

cd ".."  # back to root

# 4) Navigate to backend and copy files
echo ""
echo "Step 4: Navigating to $BACKEND_DIR and copying required files..."
cd "$BACKEND_DIR"
cp "server.py" "../$MY_FILE_SERVER_DIR/"
cp services/*.py "../$MY_FILE_SERVER_DIR/services/"

cd ".."  # back to root

# 5) Verify structure
echo ""
echo "Step 5: Verifying the final directory structure..."
cd "$MY_FILE_SERVER_DIR"
if [ -d "public" ] && [ -d "services" ] && [ -f "server.py" ] && [ -f ".nomedia" ]; then
    echo ""
    echo "✅ Successfully packaged MyFileServer..!"
else
    echo "❌ Setup failed: The final structure not as expected."
    exit 1
fi
