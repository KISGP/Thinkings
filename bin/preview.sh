#!/bin/bash

SOURCE_CONTENT_DIR="/mnt/c/Users/kis/Desktop/Thinkings"

echo "Starting Quartz preview server..."
npx quartz build --serve -d "$SOURCE_CONTENT_DIR"
