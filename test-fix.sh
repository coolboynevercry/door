#!/bin/bash

# 🧪 快速测试脚本 - 验证Vercel认证保护修复
echo "🧪 测试Vercel认证保护修复状态..."
echo ""

URL="https://door-window-shop-gb07e1gwd-coolboynevercrys-projects.vercel.app/api/test"

echo "📡 正在测试: $URL"
echo ""

# 测试API访问
RESPONSE=$(curl -s "$URL")

# 检查是否还是认证页面
if echo "$RESPONSE" | grep -q "Authentication Required"; then
    echo "❌ 问题依然存在：API被认证保护"
    echo ""
    echo "🎯 建议立即执行以下解决方案："
    echo ""
    echo "方案1: 访问团队设置关闭SSO"
    echo "https://vercel.com/teams/coolboynevercrys-projects/settings/security"
    echo ""
    echo "方案2: 重新部署到个人账户"
    echo "bash emergency-redeploy.sh (选择选项2)"
    echo ""
    echo "方案3: 换平台部署"
    echo "npm install -g netlify-cli && netlify deploy"
    
elif echo "$RESPONSE" | grep -q "API测试成功"; then
    echo "✅ 🎉 问题已解决！API访问正常！"
    echo ""
    echo "🔍 API响应："
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "🧹 现在可以清理测试文件："
    echo "rm api/test.js test-fix.sh emergency-redeploy.sh"
    
else
    echo "⚠️  收到意外响应："
    echo "$RESPONSE" | head -200
    echo ""
    echo "🔍 可能是其他配置问题，继续尝试解决方案..."
fi

echo ""
echo "📚 完整解决方案见: IMMEDIATE_SOLUTION.md" 