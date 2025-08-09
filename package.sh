#!/bin/bash
# --- SCRIPT DESCRIPTION ---
# This script automates the process of building the frontend,
# collecting backend dependencies, and organizing them into a new
# directory named 'MyFileServer' in the project root.
# This script is designed to be run in a Git Bash or other Unix-like shell environment.

# --- SCRIPT SETUP ---
# Exit the script immediately if any command fails.
set -e

# Define variables for directory and file names.
MY_FILE_SERVER_DIR="MyFileServer"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
DIST_DIR="dist"
REQUIREMENTS_FILE="requirements.txt"
LIBS_DIR="libs"

# --- MAIN LOGIC ---

# 1) Make a directory in the project root with the name MyFileServer.
echo "Step 1: Creating $MY_FILE_SERVER_DIR directory..."
mkdir -p "$MY_FILE_SERVER_DIR"

# 2) Navigate to the frontend directory and build the UI dist.
echo "Step 2: Navigating to $FRONTEND_DIR and building..."
cd "$FRONTEND_DIR"
npm run build

# 3) Move the 'dist' folder to the 'MyFileServer' directory.
echo "Step 3: Moving the '$DIST_DIR' folder..."
mv "$DIST_DIR" "../$MY_FILE_SERVER_DIR/"

# Return to the project root to perform backend tasks.
cd ".."

# 4) Navigate to the backend directory and generate 'requirements.txt' file.
echo "Step 4: Navigating to $BACKEND_DIR and freezing Python dependencies..."
cd "$BACKEND_DIR"
uv pip freeze > "$REQUIREMENTS_FILE"

# 5) Move the 'requirements.txt' file to the 'MyFileServer' directory.
echo "Step 5: Moving the '$REQUIREMENTS_FILE' file..."
mv "$REQUIREMENTS_FILE" "../$MY_FILE_SERVER_DIR/"

# 6) Copy 'server.py' and the 'services' folder to 'MyFileServer'.
# Only copy the .py files from the 'services' folder.
echo "Step 6: Copying backend files..."
cp "server.py" "../$MY_FILE_SERVER_DIR/"
mkdir -p "../$MY_FILE_SERVER_DIR/services"
cp "services/"*.py "../$MY_FILE_SERVER_DIR/services/"

# Return to the project root.
cd ".."

# 7) Navigate to the 'MyFileServer' directory and make a directory named 'libs'.
echo "Step 7: Creating the '$LIBS_DIR' directory..."
cd "$MY_FILE_SERVER_DIR"
mkdir -p "$LIBS_DIR"

# 8) Run the command 'pip install --target=libs -r requirements.txt'.
echo "Step 8: Installing Python dependencies locally into '$LIBS_DIR'..."
pip install --target="$LIBS_DIR" -r "$REQUIREMENTS_FILE"

# 9) Delete the 'requirements.txt' file.
echo "Step 9: Deleting '$REQUIREMENTS_FILE'..."
rm "$REQUIREMENTS_FILE"

# 10) Ensure the 'MyFileServer' directory contains the expected folders and file.
echo "Step 10: Verifying final directory structure..."
if [ -d "libs" ] && [ -d "dist" ] && [ -d "services" ] && [ -f "server.py" ]; then
    echo ""
    echo "✅ Successfully packaged MyFileServer..!"
    echo "The final and ready-to-use folder is created."
else
    echo "❌ Error occurred during the setup. The final directory structure is not as expected."
    exit 1
fi
