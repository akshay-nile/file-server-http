#!/bin/bash

# --- SCRIPT DESCRIPTION ---
# This script automates the process of building the frontend,
# collecting backend dependencies, and organizing them into a new
# directory named 'MyFileServer' in the project root.
# This script is designed to be run in a Git Bash or other Unix-like shell environment.

# --- SCRIPT SETUP ---
set -e  # Exit on first error

MY_FILE_SERVER_DIR="MyFileServer"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
DIST_DIR="dist"
REQUIREMENTS_FILE="requirements.txt"
LIBS_DIR="libs"

# --- MAIN LOGIC ---

# 1) Creating MyFileServer folder, Remove old one if already exists
echo "Step 1: Preparing $MY_FILE_SERVER_DIR directory..."
if [ -d "$MY_FILE_SERVER_DIR" ]; then
    echo "   Removing existing $MY_FILE_SERVER_DIR..."
    rm -rf "$MY_FILE_SERVER_DIR"
fi
mkdir -p "$MY_FILE_SERVER_DIR"
touch "$MY_FILE_SERVER_DIR/.nomedia"

# 2) Navigate to frontend and build
echo "Step 2: Navigating to $FRONTEND_DIR and building..."
cd "$FRONTEND_DIR"
npm run build

# 3) Move dist to MyFileServer
echo "Step 3: Moving $DIST_DIR..."
mv "$DIST_DIR" "../$MY_FILE_SERVER_DIR/public"

cd ".."  # back to root

# 4) Backend: generate requirements.txt
echo "Step 4: Navigating to $BACKEND_DIR and freezing Python dependencies..."
cd "$BACKEND_DIR"
uv pip freeze > "$REQUIREMENTS_FILE"

# 5) Move requirements.txt to MyFileServer
echo "Step 5: Moving $REQUIREMENTS_FILE..."
mv "$REQUIREMENTS_FILE" "../$MY_FILE_SERVER_DIR/"

# 6) Copy backend code
echo "Step 6: Copying backend files..."
cp "server.py" "../$MY_FILE_SERVER_DIR/"
mkdir -p "../$MY_FILE_SERVER_DIR/services"
cp services/*.py "../$MY_FILE_SERVER_DIR/services/"

cd ".."  # back to root

# 7) Create libs folder
echo "Step 7: Creating $LIBS_DIR..."
cd "$MY_FILE_SERVER_DIR"
mkdir -p "$LIBS_DIR"

# 8) Install dependencies into libs
echo "Step 8: Installing dependencies..."
pip install --target="$LIBS_DIR" -r "$REQUIREMENTS_FILE"

# 9) Remove requirements.txt
echo "Step 9: Removing $REQUIREMENTS_FILE..."
rm "$REQUIREMENTS_FILE"

# 10) Verify structure
echo "Step 10: Verifying final directory structure..."
if [ -d "libs" ] && [ -d "public" ] && [ -d "services" ] && [ -f "server.py" ]; then
    echo ""
    echo "✅ Successfully packaged MyFileServer..!"
else
    echo "❌ Setup failed: The final structure not as expected."
    exit 1
fi
