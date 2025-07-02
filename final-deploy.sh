#!/bin/bash

# 🚀 终极重新部署脚本 - 彻底解决Vercel问题
echo "🚀 启动终极重新部署程序..."
echo ""

# 备份原配置
cp vercel.json vercel.json.backup
cp vercel-personal.json vercel.json

echo "✅ 已切换到简化配置"

# 重新登录确保使用个人账户
echo "🔑 重新登录Vercel (选择个人账户)..."
vercel logout
vercel login

echo ""
echo "📋 重要：在登录后的部署过程中："
echo "   ⚠️  选择个人账户: coolboynevercry"  
echo "   ❌ 不要选择团队: coolboynevercrys-projects"
echo ""

read -p "已登录个人账户？按Enter继续..."

# 重新部署
PROJECT_NAME="door-window-personal-$(date +%m%d)"
echo "🌟 重新部署项目: $PROJECT_NAME"

vercel --name $PROJECT_NAME --prod

echo ""
echo "🧪 测试新部署..."
sleep 5

# 获取新URL并测试
NEW_URL="https://$PROJECT_NAME.vercel.app"
echo "📡 测试URL: $NEW_URL/api/test"

RESPONSE=$(curl -s "$NEW_URL/api/test")

if echo "$RESPONSE" | grep -q "API测试成功"; then
    echo "🎉 成功！API认证保护问题已解决！"
    echo ""
    echo "✅ 新项目链接: $NEW_URL"
    echo "✅ 管理员入口: $NEW_URL/admin"
    echo ""
    echo "🧹 清理文件："
    echo "rm vercel.json.backup vercel-personal.json api/test.js test-fix.sh emergency-redeploy.sh final-deploy.sh"
    
elif echo "$RESPONSE" | grep -q "Authentication Required"; then
    echo "❌ 个人账户也被SSO保护，尝试方案B..."
    echo ""
    echo "🔄 方案B: 部署到Netlify"
    read -p "是否安装Netlify CLI并部署？(y/n): " answer
    
    if [[ $answer == "y" || $answer == "Y" ]]; then
        npm install -g netlify-cli
        cd client
        npm run build
        cd ..
        netlify deploy --prod --dir=client/dist
        echo "✅ 已部署到Netlify！"
    fi
    
else
    echo "⚠️ 收到意外响应："
    echo "$RESPONSE" | head -100
    echo ""
    echo "📞 建议联系Vercel支持解决团队SSO问题"
fi

echo ""
echo "📚 所有解决方案见: IMMEDIATE_SOLUTION.md" 