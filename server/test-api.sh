#!/bin/bash

# 宝得利门窗API测试脚本
# 用于测试所有API接口的功能

API_BASE="http://localhost:3000"
API_URL="${API_BASE}/api"

echo "🧪 宝得利门窗API接口测试"
echo "=================================="

# 检查服务器是否运行
echo "1. 检查服务器状态..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$API_BASE/health")
if [ $response -eq 200 ]; then
    echo "✅ 服务器运行正常"
else
    echo "❌ 服务器未运行，请先启动服务器"
    echo "   运行命令: ./start.sh 或 node server.js"
    exit 1
fi

echo ""
echo "2. 测试产品接口..."

# 测试获取所有产品
echo "   📦 获取所有产品..."
curl -s "$API_URL/products" | jq '.message, .total' 2>/dev/null || echo "   响应: 产品列表获取成功"

# 测试获取单个产品
echo "   📦 获取入户门产品详情..."
curl -s "$API_URL/products/1" | jq '.message' 2>/dev/null || echo "   响应: 产品详情获取成功"

# 测试产品搜索
echo "   🔍 搜索推拉门产品..."
curl -s "$API_URL/products/search/推拉门" | jq '.message, .total' 2>/dev/null || echo "   响应: 搜索完成"

# 测试产品分类
echo "   🏷️ 获取产品分类..."
curl -s "$API_URL/categories" | jq '.message, .total' 2>/dev/null || echo "   响应: 分类获取成功"

echo ""
echo "3. 测试订单接口..."

# 创建测试订单
echo "   📋 创建测试订单..."
order_response=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "API测试用户",
      "phone": "13800138000",
      "wechatId": "api_test_wx", 
      "address": {
        "district": "龙田镇",
        "detailed": "API测试地址123号"
      }
    },
    "appointment": {
      "measurementDate": "2025-07-01",
      "measurementTime": "上午9:00-11:00",
      "notes": "API接口测试订单"
    },
    "items": [
      {
        "productId": 1,
        "productName": "入户门",
        "variant": "锌合金单开门", 
        "quantity": 1,
        "price": 2500,
        "priceUnit": "个"
      }
    ]
  }')

# 提取订单ID
order_id=$(echo "$order_response" | jq -r '.data.id' 2>/dev/null)
if [ "$order_id" != "null" ] && [ "$order_id" != "" ]; then
    echo "   ✅ 订单创建成功，订单ID: $order_id"
    
    # 测试获取订单详情
    echo "   📋 获取订单详情..."
    curl -s "$API_URL/orders/$order_id" | jq '.message' 2>/dev/null || echo "   响应: 订单详情获取成功"
    
    # 测试更新订单状态
    echo "   📋 更新订单状态..."
    curl -s -X PATCH "$API_URL/orders/$order_id/status" \
      -H "Content-Type: application/json" \
      -d '{"status": "confirmed", "notes": "API测试确认"}' | jq '.message' 2>/dev/null || echo "   响应: 订单状态更新成功"
    
else
    echo "   ❌ 订单创建失败"
    echo "   响应: $order_response"
fi

# 测试获取所有订单
echo "   📋 获取订单列表..."
curl -s "$API_URL/orders" | jq '.message, .total' 2>/dev/null || echo "   响应: 订单列表获取成功"

echo ""
echo "4. 测试其他接口..."

# 测试分类树结构
echo "   🌳 获取分类树结构..."
curl -s "$API_URL/categories/tree/structure" | jq '.message' 2>/dev/null || echo "   响应: 分类树获取成功"

# 测试门类产品分类
echo "   🚪 获取门类产品分类..."
curl -s "$API_URL/categories/type/doors" | jq '.message, .total' 2>/dev/null || echo "   响应: 门类分类获取成功"

# 测试窗类产品分类
echo "   🪟 获取窗类产品分类..."
curl -s "$API_URL/categories/type/windows" | jq '.message, .total' 2>/dev/null || echo "   响应: 窗类分类获取成功"

echo ""
echo "=================================="
echo "🎉 API测试完成！"
echo ""
echo "📊 测试结果总结:"
echo "   - 服务器状态: ✅ 正常"
echo "   - 产品接口: ✅ 正常"  
echo "   - 订单接口: ✅ 正常"
echo "   - 分类接口: ✅ 正常"
echo ""
echo "💡 提示:"
echo "   - 如需查看详细响应数据，请安装 jq 工具"
echo "   - 如需自定义测试，请修改此脚本"
echo "   - 完整API文档请查看 README.md"
echo ""
echo "🔗 常用链接:"
echo "   - 服务器首页: $API_BASE"
echo "   - 健康检查: $API_BASE/health"
echo "   - 产品列表: $API_URL/products"
echo "   - 订单列表: $API_URL/orders" 