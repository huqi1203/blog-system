#!/bin/bash
# OpenClaw Workspace 同步到 GitHub 脚本

WORKSPACE="/root/.openclaw/workspace"
REMOTE="https://github.com/huqi1203/blog-system.git"
MESSAGE="${1:-Auto sync: $(date '+%Y-%m-%d %H:%M:%S')}"

cd "$WORKSPACE" || exit 1

echo "🔄 开始同步 workspace 到 GitHub..."

# 检查 Git 状态
git status

# 添加所有变更
echo "📦 添加文件..."
git add -A

# 检查是否有变更
if git diff --cached --quiet; then
    echo "✅ 没有变更，跳过提交"
else
    # 提交
    echo "💾 提交变更..."
    git commit -m "$MESSAGE"
fi

# 推送到 GitHub
echo "🚀 推送到 GitHub..."
git push origin main || git push origin master

echo "✅ 同步完成！"
