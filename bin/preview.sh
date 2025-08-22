#!/bin/bash

SOURCE_CONTENT_DIR="/mnt/c/Users/kis/Desktop/Thinkings"

DEST_CONTENT_DIR="/home/kis/Thinkings/content"

echo "Starting Quartz preview server..."
npx quartz build --serve -d "$DEST_CONTENT_DIR"
