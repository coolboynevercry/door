#!/bin/bash

# 🚀 Netlify快速启动脚本
echo "🌟 欢迎使用Netlify备用方案！"
echo ""
echo "这个方案彻底解决了Vercel团队SSO认证保护问题"
echo ""

echo "🎯 可用选项："
echo "   1. 立即部署到Netlify (推荐)"
echo "   2. 本地开发测试"
echo "   3. 查看部署指南"
echo "   4. 测试当前Vercel状态"
echo ""

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "🚀 启动Netlify部署..."
        ./deploy-to-netlify.sh
        ;;
    2)
        echo "💻 启动本地开发环境..."
        if ! command -v netlify &> /dev/null; then
            echo "📦 安装Netlify CLI..."
            npm install -g netlify-cli
        fi
        echo "🏃‍♂️ 启动本地服务器..."
        netlify dev
        ;;
    3)
        echo "📚 查看部署指南..."
        cat NETLIFY_GUIDE.md
        ;;
    4)
        echo "🧪 测试Vercel当前状态..."
        ./test-fix.sh
        ;;
    *)
        echo "❌ 无效选择"
        ;;
esac

echo ""
echo "📚 相关文件："
echo "   - NETLIFY_GUIDE.md (部署指南)"
echo "   - deploy-to-netlify.sh (一键部署)"
echo "   - netlify/ (Functions目录)"
echo "   - netlify.toml (配置文件)"
echo ""
echo "🎉 Netlify方案优势："
echo "   ✅ 无认证保护问题"
echo "   ✅ 免费125,000次函数调用/月"
echo "   ✅ 自动SSL和CDN"
echo "   ✅ 简单部署流程" 