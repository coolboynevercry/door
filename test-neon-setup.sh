#!/bin/bash

# Neon数据库配置测试脚本

echo "🚀 测试Neon数据库配置..."
echo "======================================"

BASE_URL="https://baodeli-door.netlify.app"

echo "📋 步骤1: 检查环境变量状态"
echo "访问: ${BASE_URL}/.netlify/functions/health"
curl -s "${BASE_URL}/.netlify/functions/health" | jq '.'

echo ""
echo "📋 步骤2: 测试数据库连接"
echo "访问: ${BASE_URL}/.netlify/functions/init-database"
DB_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/init-database")
echo "$DB_RESULT" | jq '.'

# 检查数据库初始化是否成功
if echo "$DB_RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ 数据库连接成功！"
    
    echo ""
    echo "📋 步骤3: 测试用户注册（无验证码）"
    REGISTER_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-register" \
      -H "Content-Type: application/json" \
      -d '{"phone":"13800138001","password":"123456","name":"测试用户","district":"测试区域"}')
    
    echo "$REGISTER_RESULT" | jq '.'
    
    if echo "$REGISTER_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        echo "✅ 用户注册成功！"
        
        echo ""
        echo "📋 步骤4: 测试用户登录"
        LOGIN_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-login" \
          -H "Content-Type: application/json" \
          -d '{"phone":"13800138001","password":"123456"}')
        
        echo "$LOGIN_RESULT" | jq '.'
        
        if echo "$LOGIN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
            echo "✅ 用户登录成功！"
        else
            echo "❌ 用户登录失败"
        fi
    else
        echo "❌ 用户注册失败"
    fi
    
    echo ""
    echo "📋 步骤5: 测试产品API"
    PRODUCTS_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/products")
    echo "$PRODUCTS_RESULT" | jq '.'
    
    if echo "$PRODUCTS_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        echo "✅ 产品API正常！"
    else
        echo "❌ 产品API失败"
    fi
    
else
    echo "❌ 数据库连接失败，请检查Neon配置"
    echo ""
    echo "🔧 配置Neon数据库的步骤:"
    echo "1. 访问: https://app.netlify.com/projects/baodeli-door/extensions/neon"
    echo "2. 点击 'Add extension' 启用Neon"
    echo "3. 按照提示完成数据库设置"
    echo "4. 重新部署: netlify deploy --prod"
    echo "5. 运行此测试: ./test-neon-setup.sh"
fi

echo ""
echo "======================================"
echo "🎯 测试完成！"

echo ""
echo "🔗 重要链接:"
echo "   • 前端主页: ${BASE_URL}/"
echo "   • 用户注册: ${BASE_URL}/register"
echo "   • 用户登录: ${BASE_URL}/login"
echo "   • 管理后台: ${BASE_URL}/admin"
echo "   • Neon配置: https://app.netlify.com/projects/baodeli-door/extensions/neon"

echo ""
echo "📝 默认账户:"
echo "   • 管理员: admin / 123456"
echo "   • 测试用户: 13800138001 / 123456" 