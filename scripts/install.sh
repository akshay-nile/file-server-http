#!/bin/sh
# This script automates the process of installing (or updating) 
# the MyFileServer for Pydroid-3 on my Android phone


URL="https://github.com/akshay-nile/file-server-http/archive/refs/heads/master.zip"

DOWNLOAD="/storage/emulated/0/Download"
DOCUMENT="/storage/emulated/0/Documents/Pydroid 3"

ZIP="$DOWNLOAD/project.zip"
SRC="$DOWNLOAD/file-server-http-master"
DST="$DOCUMENT/MyFileServer"


echo "Pre-cleaning old junk..."
rm -rf "$ZIP"
rm -rf "$SRC"


echo "Downloading project..."
mkdir -p "$DOWNLOAD"
curl -s -L "$URL" -o "$ZIP" || exit 1


echo "Unzipping project..."
cd "$DOWNLOAD" || exit 1
unzip -oq project.zip || exit 1


if [ -e "$DST" ]; then
    echo "Updating existing installation..."
    for item in "$DST"/* "$DST"/.*; do
        name="$(basename "$item")"
    
        [ "$name" = "." ] || [ "$name" = ".." ] && continue
    
        [ "$name" = "thumbnails" ] && continue
        [ "$name" = "tokens.txt" ] && continue
    
        rm -rf "$item"
    done
else
    echo "Preparing fresh installation..."
fi

mkdir -p "$DST/services"
touch "$DST/.nomedia"


echo "Moving required files..."
mv "$SRC/frontend/dist" "$DST/public"
mv "$SRC/backend/services/"*.py "$DST/services"
mv "$SRC/backend/server.py" "$DST"
mv "$SRC/README.md" "$DST"


echo "Cleaning downloaded junk..."
rm -rf "$ZIP"
rm -rf "$SRC"


echo "Installation completed successfully ✅"
exit 0
