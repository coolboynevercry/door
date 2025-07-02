#!/bin/bash

echo "🔑 管理员登录测试工具"
echo "===================="

echo ""
echo "请选择测试环境:"
echo "1) 本地环境 (localhost:3000)"
echo "2) 生产环境 (需要输入域名)"

read -p "请选择 (1-2): " env_choice

case $env_choice in
    1)
        BASE_URL="http://localhost:3000"
        echo "📍 测试环境: 本地 ($BASE_URL)"
        ;;
    2)
        read -p "请输入生产域名 (例: https://your-app.vercel.app): " PROD_URL
        BASE_URL=$PROD_URL
        echo "📍 测试环境: 生产 ($BASE_URL)"
        ;;
    *)
        BASE_URL="http://localhost:3000"
        echo "📍 默认使用本地环境 ($BASE_URL)"
        ;;
esac

echo ""
echo "🔐 使用默认管理员账户测试登录..."

# 测试管理员登录API
echo "�� 测试管理员登录API..."
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' 2>/dev/null)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [[ $http_code -eq 200 ]]; then
    echo "✅ 登录API测试成功!"
    echo "📄 响应: $body"
    
    # 提取token (简单处理)
    if echo "$body" | grep -q "token"; then
        echo "✅ Token获取成功"
    fi
else
    echo "❌ 登录API测试失败"
    echo "📄 错误: $body"
    echo "🔍 状态码: $http_code"
fi

echo ""
echo "🌐 浏览器访问地址:"
echo "   登录页面: $BASE_URL/admin/login"
echo "   管理首页: $BASE_URL/admin"
echo ""
echo "🔑 登录信息:"
echo "   用户名: admin"
echo "   密码: 123456"

echo ""
echo "📋 如果登录失败，请检查:"
echo "   1. Vercel开发服务器是否正在运行 (vercel dev)"
echo "   2. API服务是否正常工作"
echo "   3. 环境变量是否正确配置"

