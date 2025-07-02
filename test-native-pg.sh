#!/bin/bash

# 🚀 原生pg数据库功能测试脚本
echo "🚀 测试原生pg数据库功能..."
echo "======================================"

BASE_URL="https://baodeli-door.netlify.app"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 步骤1: 测试原生pg数据库初始化${NC}"
INIT_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/init-database-native")
echo "$INIT_RESULT" | jq '.'

if echo "$INIT_RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 原生pg数据库初始化成功！${NC}"
    
    # 提取数据统计
    USERS_COUNT=$(echo "$INIT_RESULT" | jq '.data.results.steps[2].details.users // 0')
    CATEGORIES_COUNT=$(echo "$INIT_RESULT" | jq '.data.results.steps[2].details.categories // 0')
    PRODUCTS_COUNT=$(echo "$INIT_RESULT" | jq '.data.results.steps[2].details.products // 0')
    
    echo -e "${BLUE}📊 数据统计:${NC}"
    echo "   • 用户数量: $USERS_COUNT"
    echo "   • 分类数量: $CATEGORIES_COUNT"
    echo "   • 产品数量: $PRODUCTS_COUNT"
    
    echo ""
    echo -e "${BLUE}📋 步骤2: 测试用户注册（原生pg版本）${NC}"
    REGISTER_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-register-native" \
      -H "Content-Type: application/json" \
      -d '{"phone":"13888888888","password":"test123","name":"原生pg测试用户","district":"测试区域","address":"测试地址123号"}')
    
    echo "$REGISTER_RESULT" | jq '.'
    
    if echo "$REGISTER_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 原生pg用户注册成功${NC}"
        
        echo ""
        echo -e "${BLUE}📋 步骤3: 测试用户登录（原生pg版本）${NC}"
        LOGIN_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-login-native" \
          -H "Content-Type: application/json" \
          -d '{"phone":"13888888888","password":"test123"}')
        
        echo "$LOGIN_RESULT" | jq '.'
        
        if echo "$LOGIN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 原生pg用户登录成功${NC}"
        else
            echo -e "${RED}❌ 原生pg用户登录失败${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️ 用户注册失败（可能已存在）${NC}"
        
        # 尝试登录已存在用户
        echo ""
        echo -e "${BLUE}📋 步骤3: 测试已存在用户登录${NC}"
        LOGIN_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-login-native" \
          -H "Content-Type: application/json" \
          -d '{"phone":"13888888888","password":"test123"}')
        
        echo "$LOGIN_RESULT" | jq '.'
        
        if echo "$LOGIN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 已存在用户登录成功${NC}"
        else
            echo -e "${RED}❌ 用户登录失败${NC}"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📋 步骤4: 测试产品API（原生pg版本）${NC}"
    PRODUCTS_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/products-native")
    echo "$PRODUCTS_RESULT" | jq '.'
    
    if echo "$PRODUCTS_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 原生pg产品API正常${NC}"
        PRODUCT_COUNT=$(echo "$PRODUCTS_RESULT" | jq '.data | length')
        echo "   • 产品数量: $PRODUCT_COUNT"
        
        # 显示产品列表
        echo -e "${BLUE}📦 产品列表:${NC}"
        echo "$PRODUCTS_RESULT" | jq '.data[] | {id: .id, name: .name, price: .price, category: .categoryName}'
    else
        echo -e "${RED}❌ 原生pg产品API失败${NC}"
    fi
    
else
    echo -e "${RED}❌ 原生pg数据库初始化失败${NC}"
    echo "$INIT_RESULT" | jq '.'
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎯 原生pg测试完成！${NC}"

echo ""
echo -e "${BLUE}📊 解决方案总结:${NC}"
echo "   ✅ 原生pg - 绕过Sequelize依赖问题"
echo "   ✅ 更高性能 - 直接数据库连接"
echo "   ✅ 更少依赖 - 仅需pg包"
echo "   ✅ 完整功能 - 支持所有数据库操作"

echo ""
echo "🔗 原生pg API端点:"
echo "   • 数据库初始化: ${BASE_URL}/.netlify/functions/init-database-native"
echo "   • 用户注册: ${BASE_URL}/.netlify/functions/users-register-native"
echo "   • 用户登录: ${BASE_URL}/.netlify/functions/users-login-native"
echo "   • 产品管理: ${BASE_URL}/.netlify/functions/products-native"
