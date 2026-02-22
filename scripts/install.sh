#!/bin/sh
# This script automates the process of setting-up 
# the MyFileServer for Pydroid-3 on Android device

set -e
URL="https://github.com/akshay-nile/file-server-http/archive/refs/heads/package.zip"

DOWNLOAD="/storage/emulated/0/Download"
DOCUMENT="/storage/emulated/0/Documents/Pydroid 3"

ZIP="$DOWNLOAD/package.zip"
SRC="$DOWNLOAD/file-server-http-package/MyFileServer"
DST="$DOCUMENT/MyFileServer"

echo "Pre-cleaning old junk..."
rm -rf "$ZIP"
rm -rf "$SRC"

echo "Downloading package..."
mkdir -p "$DOWNLOAD"
curl -sL "$URL" -o "$ZIP" || exit 1

echo "Unzipping package..."
cd "$DOWNLOAD" || exit 1
unzip -oq package.zip || exit 1

if [ -e "$DST" ]; then
    echo "Updating existing setup..."
    for item in "$DST"/* "$DST"/.*; do
        name="$(basename "$item")"
    
        [ "$name" = "." ] || [ "$name" = ".." ] && continue
    
        [ "$name" = "thumbnails" ] && continue
        [ "$name" = "tokens.txt" ] && continue
    
        rm -rf "$item"
    done
else
    echo "Preparing fresh setup..."
fi

mkdir -p "$DST"
touch "$DST/.nomedia"

echo "Moving required files..."
mv "$SRC"/* "$DST"

echo "Cleaning downloaded junk..."
rm -rf "$ZIP"
rm -rf "$SRC"

echo "Setup finished successfully ✅"
exit 0