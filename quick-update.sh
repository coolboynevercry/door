#!/bin/bash

# 宝得利门窗系统 - 快速更新脚本
# 使用方法: ./quick-update.sh

echo "🚀 宝得利门窗系统 - 快速更新工具"
echo "================================="

# 检查当前Git状态
echo ""
echo "🔍 当前状态:"
git status --short

# 如果没有更改，退出
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ 没有需要提交的更改"
    exit 0
fi

echo ""
echo "📝 准备提交以下更改:"
git status

echo ""
echo "请选择操作类型:"
echo "1) feat - 新功能"
echo "2) fix - Bug修复" 
echo "3) style - 样式更新"
echo "4) docs - 文档更新"
echo "5) refactor - 代码重构"
echo "6) 自定义提交信息"

read -p "请选择 (1-6): " choice

case $choice in
    1)
        read -p "功能描述: " desc
        commit_message="feat: $desc"
        ;;
    2)
        read -p "修复描述: " desc
        commit_message="fix: $desc"
        ;;
    3)
        read -p "样式描述: " desc
        commit_message="style: $desc"
        ;;
    4)
        read -p "文档描述: " desc
        commit_message="docs: $desc"
        ;;
    5)
        read -p "重构描述: " desc
        commit_message="refactor: $desc"
        ;;
    6)
        read -p "提交信息: " commit_message
        ;;
    *)
        commit_message="update: $(date '+%Y-%m-%d %H:%M:%S')"
        ;;
esac

if [ -z "$commit_message" ]; then
    commit_message="update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
echo "📦 添加文件到Git..."
git add .

echo "💾 提交更改: $commit_message"
git commit -m "$commit_message"

echo ""
echo "🚀 推送到GitHub..."
if git push origin main; then
    echo ""
    echo "✅ 更新成功完成！"
    echo "📊 查看部署状态: https://vercel.com/dashboard"
    echo "🌐 您的网站将在1-2分钟后更新"
else
    echo ""
    echo "❌ 推送失败，请检查网络连接或权限"
    exit 1
fi

