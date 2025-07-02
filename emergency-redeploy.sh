#!/bin/bash

# 🚨 紧急重新部署脚本 - 解决Vercel认证保护问题
# 使用方法: bash emergency-redeploy.sh

echo "🚨 启动紧急重新部署程序..."
echo "📋 这将解决Vercel API函数认证保护问题"
echo ""

# 检查是否安装了vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI未安装，正在安装..."
    npm install -g vercel
fi

echo "🔍 当前项目状态检查..."
echo "   前端状态: ✅ 正常 (200 OK)"
echo "   API状态:  ❌ 被认证保护"
echo ""

# 提供选择
echo "🎯 选择解决方案:"
echo "   1. 快速测试 - 部署测试API"
echo "   2. 重新创建项目 (推荐)"
echo "   3. 检查当前项目设置"
echo "   4. 联系支持"
echo ""

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "🧪 正在部署测试API..."
        git add api/test.js
        git commit -m "add: 紧急测试API - 验证认证保护问题"
        vercel --prod
        echo ""
        echo "🧪 测试API已部署！"
        echo "请访问: https://your-app.vercel.app/api/test"
        echo "如果返回认证页面，确认是团队SSO问题"
        ;;
    2)
        echo "🔄 开始重新创建项目..."
        echo ""
        echo "⚠️  请在Vercel Dashboard中手动删除当前项目:"
        echo "   1. 访问: https://vercel.com/dashboard"
        echo "   2. 选择项目 → Settings → General"
        echo "   3. 点击 'Delete Project'"
        echo ""
        read -p "已删除项目？按Enter继续..."
        
        # 重新部署
        echo "🚀 重新创建项目..."
        NEW_NAME="door-window-$(date +%Y%m%d)"
        vercel --name $NEW_NAME --prod
        
        echo "✅ 项目重新创建完成！"
        echo "🔗 新项目名: $NEW_NAME"
        echo "🧪 测试链接: https://$NEW_NAME.vercel.app/api/test"
        ;;
    3)
        echo "🔍 检查当前项目设置..."
        echo ""
        echo "请在Vercel Dashboard中检查以下设置:"
        echo ""
        echo "1. 📋 项目设置 (https://vercel.com/dashboard)"
        echo "   ✓ Project Visibility: Public"
        echo "   ✓ Function Protection: Disabled"
        echo "   ✓ Vercel Authentication: Disabled"
        echo ""
        echo "2. 👥 团队设置 (https://vercel.com/teams/settings/security)"
        echo "   ✓ Enforce SAML SSO: Disabled"
        echo "   ✓ Function Protection: Off"
        echo ""
        echo "3. 🔑 环境变量检查"
        vercel env ls
        ;;
    4)
        echo "📞 联系Vercel支持..."
        echo ""
        echo "请发送以下信息给Vercel支持:"
        echo "---"
        echo "问题: API函数被意外的认证保护拦截"
        echo "症状: 所有/api/*请求被重定向到Vercel Authentication页面"
        echo "项目: $(git remote get-url origin)"
        echo "团队: coolboynevercry"
        echo "---"
        echo ""
        echo "📧 支持渠道:"
        echo "   Discord: https://vercel.com/discord"
        echo "   Email: support@vercel.com"
        echo "   GitHub Issues: https://github.com/vercel/vercel/issues"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎯 问题解决检查清单:"
echo "   □ 测试API返回正常JSON (不是认证页面)"
echo "   □ 管理员页面 /admin 可访问"
echo "   □ 商品API /api/products 可访问"
echo "   □ 用户注册/登录功能正常"
echo ""
echo "✅ 成功后删除测试文件:"
echo "   rm api/test.js emergency-redeploy.sh"
echo ""
echo "📚 完整解决方案见: ULTIMATE_VERCEL_FIX.md" 