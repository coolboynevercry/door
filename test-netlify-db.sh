#!/bin/bash

# 🚀 Netlify DB 配置测试脚本
echo "🚀 测试Netlify DB配置..."
echo "======================================"

BASE_URL="https://baodeli-door.netlify.app"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 步骤1: 检查Netlify DB环境变量${NC}"
ENV_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/check-env")
echo "$ENV_RESULT" | jq '.'

# 检查是否有NETLIFY_DATABASE_URL
if echo "$ENV_RESULT" | jq -e '.data.environment_variables.available.NETLIFY_DATABASE_URL' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Netlify DB环境变量已配置${NC}"
    
    echo ""
    echo -e "${BLUE}📋 步骤2: 测试数据库初始化${NC}"
    DB_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/init-database")
    echo "$DB_RESULT" | jq '.'
    
    if echo "$DB_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库初始化成功！${NC}"
        
        echo ""
        echo -e "${BLUE}📋 步骤3: 测试用户功能${NC}"
        # 用户注册测试
        REGISTER_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-register" \
          -H "Content-Type: application/json" \
          -d '{"phone":"13999998888","password":"test123","name":"Netlify DB测试用户","district":"测试区域"}')
        
        if echo "$REGISTER_RESULT" | jq -e '.success' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 用户注册成功${NC}"
            
            # 用户登录测试
            LOGIN_RESULT=$(curl -s -X POST "${BASE_URL}/.netlify/functions/users-login" \
              -H "Content-Type: application/json" \
              -d '{"phone":"13999998888","password":"test123"}')
            
            if echo "$LOGIN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
                echo -e "${GREEN}✅ 用户登录成功${NC}"
            else
                echo -e "${RED}❌ 用户登录失败${NC}"
                echo "$LOGIN_RESULT" | jq '.'
            fi
        else
            echo -e "${YELLOW}⚠️ 用户注册失败（可能已存在）${NC}"
            echo "$REGISTER_RESULT" | jq '.'
        fi
        
        echo ""
        echo -e "${BLUE}📋 步骤4: 测试产品API${NC}"
        PRODUCTS_RESULT=$(curl -s "${BASE_URL}/.netlify/functions/products")
        if echo "$PRODUCTS_RESULT" | jq -e '.success' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 产品API正常${NC}"
            echo "产品数量: $(echo "$PRODUCTS_RESULT" | jq '.data | length')"
        else
            echo -e "${RED}❌ 产品API失败${NC}"
            echo "$PRODUCTS_RESULT" | jq '.'
        fi
        
    else
        echo -e "${RED}❌ 数据库初始化失败${NC}"
        echo "$DB_RESULT" | jq '.'
    fi
    
else
    echo -e "${YELLOW}⚠️ Netlify DB未配置，请完成以下步骤：${NC}"
    echo ""
    echo "1. 访问: https://app.netlify.com/sites/baodeli-door/extensions"
    echo "2. 搜索并安装 'Neon database' 扩展"
    echo "3. 点击 Extensions > Neon > Add database"
    echo "4. 完成Neon账户连接和数据库声明"
    echo "5. 重新运行此测试脚本"
    echo ""
    echo -e "${BLUE}📖 详细指南: https://docs.netlify.com/storage/netlify-db/#add-a-database-in-the-netlify-ui${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎯 测试完成！${NC}"

echo ""
echo "🔗 重要链接:"
echo "   • 主页: ${BASE_URL}/"
echo "   • 管理后台: ${BASE_URL}/admin"
echo "   • Netlify控制台: https://app.netlify.com/sites/baodeli-door"
echo "   • 扩展管理: https://app.netlify.com/sites/baodeli-door/extensions" 