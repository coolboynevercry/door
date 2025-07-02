#!/bin/bash

# 快速数据库配置脚本

echo "🚀 宝得利门窗系统 - 快速数据库配置"
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}当前可用的免费数据库选项：${NC}"
echo "1. 🔄 重新配置Neon (推荐)"
echo "2. 🐘 ElephantSQL (20MB免费)"
echo "3. 🚂 Railway PostgreSQL (5GB免费)"
echo "4. 🦀 CockroachDB (5GB免费)"
echo "5. 🔙 恢复Supabase连接"
echo "6. ⚡ 自定义数据库连接"

echo ""
read -p "请选择配置方案 (1-6): " choice

case $choice in
  1)
    echo -e "${YELLOW}重新配置Neon...${NC}"
    echo "1. 访问: https://app.netlify.com/projects/baodeli-door/extensions/neon"
    echo "2. 如果扩展显示错误，点击 'Disable' 然后重新 'Enable'"
    echo "3. 按照向导完成数据库创建"
    echo "4. 返回终端运行: netlify deploy --prod"
    ;;
  
  2)
    echo -e "${YELLOW}配置ElephantSQL...${NC}"
    echo "1. 访问: https://www.elephantsql.com/"
    echo "2. 注册免费账户"
    echo "3. 创建新实例 (Tiny Turtle - FREE)"
    echo "4. 复制连接URL"
    echo "5. 运行: netlify env:set DATABASE_URL \"你的连接URL\""
    echo "6. 运行: netlify deploy --prod"
    ;;
  
  3)
    echo -e "${YELLOW}配置Railway PostgreSQL...${NC}"
    echo "1. 访问: https://railway.app/"
    echo "2. 登录并创建新项目"
    echo "3. 添加PostgreSQL服务"
    echo "4. 在Variables页面复制DATABASE_URL"
    echo "5. 运行: netlify env:set DATABASE_URL \"你的连接URL\""
    echo "6. 运行: netlify deploy --prod"
    ;;
  
  4)
    echo -e "${YELLOW}配置CockroachDB...${NC}"
    echo "1. 访问: https://cockroachlabs.cloud/"
    echo "2. 创建免费集群 (CockroachDB Serverless)"
    echo "3. 下载CA证书 (可选)"
    echo "4. 复制连接字符串"
    echo "5. 运行: netlify env:set DATABASE_URL \"你的连接URL\""
    echo "6. 运行: netlify deploy --prod"
    ;;
  
  5)
    echo -e "${YELLOW}恢复Supabase连接...${NC}"
    read -p "请输入Supabase连接URL: " supabase_url
    netlify env:set DATABASE_URL "$supabase_url"
    netlify env:set SUPABASE_DB_URL "$supabase_url"
    echo -e "${GREEN}✅ Supabase连接已设置${NC}"
    echo "正在重新部署..."
    netlify deploy --prod
    ;;
  
  6)
    echo -e "${YELLOW}自定义数据库连接...${NC}"
    read -p "请输入数据库连接URL: " custom_url
    netlify env:set DATABASE_URL "$custom_url"
    echo -e "${GREEN}✅ 自定义数据库连接已设置${NC}"
    echo "正在重新部署..."
    netlify deploy --prod
    ;;
  
  *)
    echo -e "${RED}❌ 无效选择${NC}"
    exit 1
    ;;
esac

echo ""
echo "======================================"
echo -e "${GREEN}🎯 配置完成！${NC}"

echo ""
echo "⏭️  下一步操作:"
echo "1. 等待部署完成"
echo "2. 测试数据库连接:"
echo "   curl https://baodeli-door.netlify.app/.netlify/functions/init-database"
echo "3. 运行完整测试:"
echo "   ./test-neon-setup.sh"

echo ""
echo "🔗 重要链接:"
echo "   • 前端主页: https://baodeli-door.netlify.app/"
echo "   • 环境变量: https://app.netlify.com/projects/baodeli-door/settings/env"
echo "   • 部署日志: https://app.netlify.com/projects/baodeli-door/deploys" 