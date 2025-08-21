#!/bin/bash

SOURCE_CONTENT_DIR="/mnt/c/Users/kis/Desktop/Thinkings"
DEST_CONTENT_DIR="/home/kis/Thinkings/content"

# 排除的文件和目录
EXCLUDE_OPTIONS=(
  --exclude '.obsidian/'
  --exclude '.trash/'
  --exclude 'desktop.ini'
  --exclude '*.pdf'
)

# --- 脚本执行逻辑 ---

echo "step 1: 复制笔记到项目..."
rm -rf "$DEST_CONTENT_DIR"
rsync -ah --info=progress2 --delete "${EXCLUDE_OPTIONS[@]}" "$SOURCE_CONTENT_DIR/" "$DEST_CONTENT_DIR"

echo "step 2: 开始同步..."
npx quartz sync --no-pull

echo "同步成功"

# wsl.exe bash -ic "cd /home/kis/quartz && ./bin/sync.sh"