#!/bin/bash

echo "🧪 测试数据库连接修复"
echo "=========================="

# 基础URL
BASE_URL="https://doors-ib2ly4lb9-coolboynevercrys-projects.vercel.app"

echo ""
echo "1️⃣ 测试健康检查API..."
echo "URL: $BASE_URL/api/health"
echo ""

curl -s "$BASE_URL/api/health" | head -50

echo ""
echo ""
echo "2️⃣ 测试产品列表API..."
echo "URL: $BASE_URL/api/products"
echo ""

curl -s "$BASE_URL/api/products" | head -50

echo ""
echo ""
echo "3️⃣ 测试管理员页面路由..."
echo "URL: $BASE_URL/admin"
echo ""

curl -I "$BASE_URL/admin" 2>/dev/null | head -5

echo ""
echo ""
echo "4️⃣ 测试Hash路由管理员页面..."
echo "URL: $BASE_URL/#/admin"
echo ""

curl -I "$BASE_URL/#/admin" 2>/dev/null | head -5

echo ""
echo ""
echo "🎯 测试完成！"
echo ""
echo "预期结果："
echo "- 健康检查: 应该返回JSON格式的健康状态"
echo "- 产品API: 应该返回JSON格式的产品列表"
echo "- /admin: 应该返回200状态码而不是404"
echo "- /#/admin: 应该返回200状态码（Hash路由备用方案）"
echo ""
echo "如果看到数据库连接错误，请等待几分钟让部署完成" 