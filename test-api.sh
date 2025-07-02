#!/bin/bash

# 宝得利门窗系统 - API测试脚本

echo "🧪 宝得利门窗系统 - API测试工具"
echo "================================"

# 设置默认URL
LOCAL_URL="http://localhost:3000"
PROD_URL=""

echo ""
echo "请选择测试环境:"
echo "1) 本地环境 (localhost:3000)"
echo "2) 生产环境 (需要输入域名)"

read -p "请选择 (1-2): " env_choice

case $env_choice in
    1)
        BASE_URL=$LOCAL_URL
        echo "📍 测试环境: 本地 ($BASE_URL)"
        ;;
    2)
        read -p "请输入生产域名 (例: https://your-app.vercel.app): " PROD_URL
        BASE_URL=$PROD_URL
        echo "📍 测试环境: 生产 ($BASE_URL)"
        ;;
    *)
        BASE_URL=$LOCAL_URL
        echo "📍 默认使用本地环境 ($BASE_URL)"
        ;;
esac

echo ""
echo "🔍 开始API测试..."

# 测试函数
test_api() {
    local url=$1
    local method=${2:-GET}
    local data=$3
    local description=$4
    
    echo ""
    echo "📡 测试: $description"
    echo "   URL: $method $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo "   ✅ 状态: $http_code"
        if [[ ${#body} -gt 100 ]]; then
            echo "   📄 响应: ${body:0:100}..."
        else
            echo "   📄 响应: $body"
        fi
    else
        echo "   ❌ 状态: $http_code"
        echo "   📄 错误: $body"
    fi
}

# 1. 健康检查
test_api "$BASE_URL/api/health" "GET" "" "健康检查"

# 2. 商品列表
test_api "$BASE_URL/api/products" "GET" "" "获取商品列表"

# 3. 管理员登录
echo ""
echo "🔐 测试管理员登录..."
read -p "管理员用户名 (默认: admin): " admin_user
read -s -p "管理员密码: " admin_pass
echo ""

admin_user=${admin_user:-admin}
if [ -n "$admin_pass" ]; then
    login_data="{\"username\":\"$admin_user\",\"password\":\"$admin_pass\"}"
    test_api "$BASE_URL/api/admin/login" "POST" "$login_data" "管理员登录"
else
    echo "⚠️  跳过管理员登录测试 (未输入密码)"
fi

# 4. 统计数据 (需要管理员权限)
echo ""
echo "请选择其他测试:"
echo "1) 用户注册测试"
echo "2) 用户登录测试"
echo "3) 商品创建测试"
echo "4) 跳过"

read -p "请选择 (1-4): " test_choice

case $test_choice in
    1)
        echo ""
        echo "📝 用户注册测试..."
        read -p "测试手机号 (默认: 13800138000): " test_phone
        read -p "测试密码 (默认: test123): " test_password
        
        test_phone=${test_phone:-13800138000}
        test_password=${test_password:-test123}
        
        register_data="{\"phone\":\"$test_phone\",\"password\":\"$test_password\",\"name\":\"测试用户\"}"
        test_api "$BASE_URL/api/users/register" "POST" "$register_data" "用户注册"
        ;;
    2)
        echo ""
        echo "🔑 用户登录测试..."
        read -p "手机号: " user_phone
        read -s -p "密码: " user_password
        echo ""
        
        if [ -n "$user_phone" ] && [ -n "$user_password" ]; then
            login_data="{\"phone\":\"$user_phone\",\"password\":\"$user_password\"}"
            test_api "$BASE_URL/api/users/login" "POST" "$login_data" "用户登录"
        fi
        ;;
    3)
        echo ""
        echo "🛒 商品创建测试..."
        product_data='{"name":"测试商品","price":100,"description":"这是一个测试商品","category":"门"}'
        test_api "$BASE_URL/api/products" "POST" "$product_data" "创建商品"
        ;;
    *)
        echo "⚠️  跳过额外测试"
        ;;
esac

echo ""
echo "🎯 测试完成!"
echo ""
echo "💡 常用测试命令:"
echo "   健康检查: curl $BASE_URL/api/health"
echo "   商品列表: curl $BASE_URL/api/products"
echo "   管理员登录: curl -X POST $BASE_URL/api/admin/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"your-password\"}'"

