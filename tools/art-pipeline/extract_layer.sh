#!/bin/bash
# Crops the LPC "walk" block (0,512,512,256) from a full spritesheet export,
# splits into 4 directional rows, reorders to south/north/east/west, and
# upscales 2x nearest-neighbor to the project's 128px frame convention.
# Usage: extract_layer.sh <input_full_sheet.png> <output_directional.png>
set -euo pipefail
IN="$1"
OUT="$2"
TMP=$(mktemp -d)

magick "$IN" -crop 512x256+0+512 +repage "$TMP/walk.png"
magick "$TMP/walk.png" -crop 512x64+0+0 +repage "$TMP/row_up.png"
magick "$TMP/walk.png" -crop 512x64+0+64 +repage "$TMP/row_left.png"
magick "$TMP/walk.png" -crop 512x64+0+128 +repage "$TMP/row_down.png"
magick "$TMP/walk.png" -crop 512x64+0+192 +repage "$TMP/row_right.png"

magick "$TMP/row_down.png" "$TMP/row_up.png" "$TMP/row_right.png" "$TMP/row_left.png" -append "$TMP/reordered.png"
magick "$TMP/reordered.png" -filter point -resize 200% "$OUT"

rm -rf "$TMP"
echo "wrote $OUT"
