#!/bin/bash

# 宝得利门窗系统 - 快速更新脚本

echo "🔍 检查当前状态..."
git status

echo "📝 添加所有更改..."
git add .

echo "📋 请输入提交信息:"
read -p "提交描述: " commit_message

if [ -z "$commit_message" ]; then
    commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "💾 提交更改..."
git commit -m "$commit_message"

echo "🚀 推送到GitHub..."
git push origin main

echo "✅ 更新完成！Vercel将自动部署..."
echo "📊 可以访问 https://vercel.com/dashboard 查看部署状态"
