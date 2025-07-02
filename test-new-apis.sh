#!/bin/bash

# 新API功能测试脚本
# 测试所有转化后的Serverless Functions API

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 基础URL设置
BASE_URL="http://localhost:3000"  # 本地测试
# BASE_URL="https://your-app.vercel.app"  # 生产环境

echo -e "${BLUE}=== 宝得利门窗 - 新API功能测试 ===${NC}"
echo ""

# 测试变量
TEST_PHONE="13800138000"
TEST_PASSWORD="123456"
TOKEN=""

# 辅助函数
print_test() {
    echo -e "${YELLOW}测试: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local description=$5
    
    print_test "$description"
    
    if [ -n "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "$headers" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
        print_success "HTTP $http_code - $description"
        echo "响应: $body" | jq . 2>/dev/null || echo "响应: $body"
    else
        print_error "HTTP $http_code - $description 失败"
        echo "响应: $body"
    fi
    echo ""
}

echo -e "${BLUE}1. 用户注册/登录 API 测试${NC}"
echo "================================"

# 用户注册
test_api "POST" "/api/users/register" '{
    "phone": "'$TEST_PHONE'",
    "password": "'$TEST_PASSWORD'",
    "name": "测试用户",
    "verificationCode": "123456"
}' "" "用户注册"

# 用户登录 (密码方式)
login_response=$(curl -s -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/json" \
    -d '{
        "phone": "'$TEST_PHONE'",
        "password": "'$TEST_PASSWORD'",
        "loginType": "password"
    }')

TOKEN=$(echo "$login_response" | jq -r '.data.token // empty' 2>/dev/null)

test_api "POST" "/api/users/login" '{
    "phone": "'$TEST_PHONE'",
    "password": "'$TEST_PASSWORD'",
    "loginType": "password"
}' "" "用户登录 (密码方式)"

# 用户信息获取
if [ -n "$TOKEN" ]; then
    test_api "GET" "/api/users/profile" '{}' "Authorization: Bearer $TOKEN" "获取用户信息"
    
    # 更新用户信息
    test_api "PUT" "/api/users/profile" '{
        "name": "测试用户更新",
        "wechatId": "test_wechat",
        "district": "测试区域",
        "address": "测试地址123号"
    }' "Authorization: Bearer $TOKEN" "更新用户信息"
fi

echo -e "${BLUE}2. 订单管理 API 测试${NC}"
echo "=========================="

# 创建订单
ORDER_ID=""
order_response=$(curl -s -X POST "$BASE_URL/api/orders" \
    -H "Content-Type: application/json" \
    -d '{
        "products": [
            {
                "name": "测试门窗",
                "price": 500,
                "quantity": 2
            }
        ],
        "totalAmount": 1000,
        "customerName": "测试客户",
        "customerPhone": "'$TEST_PHONE'",
        "installAddress": "测试安装地址"
    }')

ORDER_ID=$(echo "$order_response" | jq -r '.data.id // empty' 2>/dev/null)

test_api "POST" "/api/orders" '{
    "products": [
        {
            "name": "测试门窗",
            "price": 500,
            "quantity": 2
        }
    ],
    "totalAmount": 1000,
    "customerName": "测试客户",
    "customerPhone": "'$TEST_PHONE'",
    "installAddress": "测试安装地址"
}' "" "创建订单"

# 获取订单列表
test_api "GET" "/api/orders?page=1&limit=10" '{}' "" "获取订单列表"

# 获取订单详情
if [ -n "$ORDER_ID" ]; then
    test_api "GET" "/api/orders/$ORDER_ID" '{}' "" "获取订单详情"
    
    # 更新订单状态
    test_api "PATCH" "/api/orders/$ORDER_ID" '{
        "status": "confirmed",
        "notes": "订单已确认"
    }' "" "更新订单状态"
fi

echo -e "${BLUE}3. 聊天系统 API 测试${NC}"
echo "========================"

# 创建聊天会话
SESSION_ID=""
session_response=$(curl -s -X POST "$BASE_URL/api/chat/session" \
    -H "Content-Type: application/json" \
    -d '{}')

SESSION_ID=$(echo "$session_response" | jq -r '.data.sessionId // empty' 2>/dev/null)

test_api "POST" "/api/chat/session" '{}' "" "创建聊天会话"

# 发送聊天消息
if [ -n "$SESSION_ID" ]; then
    test_api "POST" "/api/chat/message" '{
        "sessionId": "'$SESSION_ID'",
        "message": "你好，我想了解门窗价格",
        "userName": "测试用户"
    }' "" "发送聊天消息"
    
    # 测试AI回复 - 询问材质
    test_api "POST" "/api/chat/message" '{
        "sessionId": "'$SESSION_ID'",
        "message": "有什么材质可以选择？",
        "userName": "测试用户"
    }' "" "询问材质信息"
    
    # 测试转人工
    test_api "POST" "/api/chat/message" '{
        "sessionId": "'$SESSION_ID'",
        "message": "转人工客服",
        "userName": "测试用户"
    }' "" "转人工客服"
fi

echo -e "${BLUE}4. 管理员功能测试${NC}"
echo "======================"

# 管理员登录
ADMIN_TOKEN=""
admin_login_response=$(curl -s -X POST "$BASE_URL/api/admin/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "admin",
        "password": "123456"
    }')

ADMIN_TOKEN=$(echo "$admin_login_response" | jq -r '.data.token // empty' 2>/dev/null)

test_api "POST" "/api/admin/login" '{
    "username": "admin",
    "password": "123456"
}' "" "管理员登录"

if [ -n "$ADMIN_TOKEN" ]; then
    # 获取管理统计数据
    test_api "GET" "/api/admin/stats" '{}' "Authorization: Bearer $ADMIN_TOKEN" "获取管理统计数据"
    
    # 合同生成测试
    test_api "POST" "/api/contracts" '{
        "clientName": "测试客户",
        "clientContact": "'$TEST_PHONE'",
        "signDate": "2024-01-15",
        "installAddress": "测试安装地址",
        "products": [
            {
                "productName": "测试门窗",
                "quantity": 2,
                "unit": "扇",
                "unitPrice": 500
            }
        ]
    }' "Authorization: Bearer $ADMIN_TOKEN" "生成合同"
    
    # 获取合同列表
    test_api "GET" "/api/contracts?page=1&limit=10" '{}' "Authorization: Bearer $ADMIN_TOKEN" "获取合同列表"
fi

echo -e "${BLUE}5. 健康检查${NC}"
echo "==============="

test_api "GET" "/api/health" '{}' "" "API健康检查"

echo ""
echo -e "${GREEN}=== API测试完成 ===${NC}"
echo -e "${YELLOW}注意事项:${NC}"
echo "1. 确保数据库连接正常"
echo "2. 检查环境变量配置"
echo "3. 验证JWT_SECRET设置"
echo "4. 文件上传功能需要前端表单测试"
echo ""
echo -e "${BLUE}如需测试生产环境，请修改脚本中的BASE_URL${NC}" 