#!/bin/sh
# This script automates the process of packaging
# the MyFileServer for Pydroid-3 on my Android phone

URL="https://github.com/akshay-nile/file-server-http/archive/refs/heads/master.zip"

DOWNLOAD="/storage/emulated/0/Download"
DOCS="/storage/emulated/0/Documents/Pydroid 3"

ZIP="$DOWNLOAD/project.zip"
SRC="$DOWNLOAD/file-server-http-master"
DEST="$DOWNLOAD/MyFileServer"
OLD_DEST="$DOCS/MyFileServer"

TOKENS_SRC="$OLD_DEST/tokens.txt"
THUMB_SRC="$OLD_DEST/thumbnails"

echo "Pre-cleaning Download folder..."

# Delete old zip and extracted folder if they exist
rm -rf "$ZIP"
rm -rf "$SRC"
rm -rf "$DEST"

echo "Downloading project..."

mkdir -p "$DOWNLOAD"
curl -L "$URL" -o "$ZIP" || exit 1

echo "Unzipping..."
cd "$DOWNLOAD" || exit 1
unzip -oq project.zip || exit 1

echo "Preparing MyFileServer..."

# Fresh MyFileServer in Download
mkdir "$DEST"
touch "$DEST/.nomedia"

# 1) frontend/dist -> public
mv "$SRC/frontend/dist" "$DEST/public"

# 2) services -> services
mv "$SRC/backend/services" "$DEST/services"

# 3) server.py -> root
mv "$SRC/backend/server.py" "$DEST/server.py"

# 4) README.md
mv "$SRC/README.md" "$DEST/README.md"

# 5) tokens.txt (if exists)
if [ -f "$TOKENS_SRC" ]; then
    echo "Found tokens.txt, preserving it"
    mv "$TOKENS_SRC" "$DEST/tokens.txt"
fi

# 6) thumbnails (if exists)
if [ -f "$THUMB_SRC" ]; then
    echo "Found thumbnails, preserving it"
    mv "$THUMB_SRC" "$DEST/thumbnails"
fi


# Remove old installed MyFileServer
rm -rf "$OLD_DEST"

# Move fresh MyFileServer to Documents/Pydroid 3
mv "$DEST" "$DOCS/"

echo "Cleaning downloaded junk..."

# Remove zip and extracted repo
rm -rf "$ZIP"
rm -rf "$SRC"

echo "Installation Completed Successfully ✅"
