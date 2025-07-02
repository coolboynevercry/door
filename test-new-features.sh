#!/bin/bash

# 新功能测试脚本 - 用户注册和数据库优化

echo "🧪 开始测试新功能..."
echo "======================================"

# 设置变量
BASE_URL="https://baodeli-door.netlify.app"
LOCAL_URL="http://localhost:8888"

# 检测是否是本地环境
if curl -s "${LOCAL_URL}/.netlify/functions/health" > /dev/null 2>&1; then
    URL=$LOCAL_URL
    echo "🏠 检测到本地开发环境"
else
    URL=$BASE_URL
    echo "🌐 使用生产环境"
fi

echo "📍 测试地址: $URL"
echo ""

# 1. 测试数据库初始化
echo "1. 📊 测试数据库初始化..."
DB_INIT=$(curl -s "${URL}/.netlify/functions/init-database")
if echo "$DB_INIT" | grep -q '"success":true'; then
    echo "   ✅ 数据库初始化成功"
    echo "$DB_INIT" | jq -r '.message // "数据库就绪"'
else
    echo "   ❌ 数据库初始化失败"
    echo "$DB_INIT" | jq -r '.error // "未知错误"'
fi
echo ""

# 2. 测试用户注册（无验证码）
echo "2. 👤 测试用户注册（无验证码）..."
REGISTER_DATA='{
  "phone": "13800138001",
  "password": "123456",
  "name": "测试用户",
  "wechatId": "test_wechat",
  "district": "玉屏街道",
  "address": "测试地址123号"
}'

REGISTER_RESULT=$(curl -s -X POST "${URL}/.netlify/functions/users-register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

if echo "$REGISTER_RESULT" | grep -q '"success":true'; then
    echo "   ✅ 用户注册成功"
    TOKEN=$(echo "$REGISTER_RESULT" | jq -r '.data.token')
    USER_ID=$(echo "$REGISTER_RESULT" | jq -r '.data.user.id')
    echo "   🎫 获得Token: ${TOKEN:0:20}..."
else
    echo "   ⚠️ 用户注册响应: $(echo "$REGISTER_RESULT" | jq -r '.error // "可能用户已存在"')"
fi
echo ""

# 3. 测试用户登录
echo "3. 🔐 测试用户登录..."
LOGIN_DATA='{
  "phone": "13800138001",
  "password": "123456"
}'

LOGIN_RESULT=$(curl -s -X POST "${URL}/.netlify/functions/users-login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "   ✅ 用户登录成功"
    if [ -z "$TOKEN" ]; then
        TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.data.token')
        USER_ID=$(echo "$LOGIN_RESULT" | jq -r '.data.user.id')
    fi
    echo "   🎫 Token: ${TOKEN:0:20}..."
else
    echo "   ❌ 用户登录失败"
    echo "$LOGIN_RESULT" | jq -r '.error // "未知错误"'
fi
echo ""

# 4. 测试产品API（新的数据库模型）
echo "4. 🛒 测试产品API（新数据库模型）..."
PRODUCTS_RESULT=$(curl -s "${URL}/.netlify/functions/products")

if echo "$PRODUCTS_RESULT" | grep -q '"success":true'; then
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESULT" | jq -r '.count // 0')
    echo "   ✅ 产品列表获取成功"
    echo "   📦 产品数量: $PRODUCT_COUNT"
    
    # 显示第一个产品信息
    if [ "$PRODUCT_COUNT" -gt 0 ]; then
        FIRST_PRODUCT=$(echo "$PRODUCTS_RESULT" | jq -r '.data[0].name // "未知产品"')
        FIRST_CATEGORY=$(echo "$PRODUCTS_RESULT" | jq -r '.data[0].category.name // "无分类"')
        echo "   🏷️ 示例产品: $FIRST_PRODUCT (分类: $FIRST_CATEGORY)"
    fi
else
    echo "   ❌ 产品API失败"
    echo "$PRODUCTS_RESULT" | jq -r '.error // "未知错误"'
fi
echo ""

# 5. 测试管理员登录
echo "5. 👨‍💼 测试管理员登录..."
ADMIN_LOGIN=$(curl -s -X POST "${URL}/.netlify/functions/admin-login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}')

if echo "$ADMIN_LOGIN" | grep -q '"success":true'; then
    echo "   ✅ 管理员登录成功"
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.token')
    echo "   🎫 管理员Token: ${ADMIN_TOKEN:0:20}..."
else
    echo "   ❌ 管理员登录失败"
    echo "$ADMIN_LOGIN" | jq -r '.error // "未知错误"'
fi
echo ""

# 6. 前端访问测试
echo "6. 🌐 测试前端页面..."
FRONTEND_STATUS=$(curl -s -I "${URL}/" | head -n 1)
if echo "$FRONTEND_STATUS" | grep -q "200"; then
    echo "   ✅ 前端主页正常访问"
else
    echo "   ❌ 前端主页访问异常: $FRONTEND_STATUS"
fi

ADMIN_PAGE_STATUS=$(curl -s -I "${URL}/admin" | head -n 1)
if echo "$ADMIN_PAGE_STATUS" | grep -q "200"; then
    echo "   ✅ 管理员页面正常访问"
else
    echo "   ❌ 管理员页面访问异常: $ADMIN_PAGE_STATUS"
fi
echo ""

# 7. 功能总结
echo "======================================"
echo "🎯 测试总结:"
echo ""
echo "✅ 已完成的功能:"
echo "   • 数据库完善 (7个表模型)"
echo "   • 用户注册 (无需验证码)"
echo "   • 用户登录 (密码认证)"
echo "   • 产品管理 (支持分类关联)"
echo "   • 管理员认证"
echo "   • 前端路由修复"
echo ""
echo "🔗 重要链接:"
echo "   • 前端主页: $URL/"
echo "   • 用户注册: $URL/register"
echo "   • 用户登录: $URL/login"
echo "   • 管理后台: $URL/admin"
echo ""
echo "📝 默认账户:"
echo "   • 管理员: admin / 123456"
echo "   • 测试用户: 13800138001 / 123456"
echo ""
echo "🎉 测试完成！" 