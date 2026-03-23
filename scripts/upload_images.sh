#!/bin/bash

# Get script location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." &> /dev/null && pwd)"
IMAGE_PATH="$PROJECT_ROOT/services/docs/Architecture-phase-1.0.jpg"

# 20 curl uploads with absolute paths

for i in {01..30}; do
  TITLE="Image-$i"
  WIDTH=$((50 + 10 * 10#$i))
  HEIGHT=$((60 + 10 * 10#$i))
  
  echo "📤 Uploading $TITLE ($WIDTH x $HEIGHT)..."
  
  curl -s -X POST http://localhost:3000/images \n    -F "file=@$IMAGE_PATH" \n    -F "width=$WIDTH" \n    -F "height=$HEIGHT" \n    -F "title=$TITLE"
done
