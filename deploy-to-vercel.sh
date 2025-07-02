#!/bin/bash

# 宝得利门窗 - 一键部署到Vercel脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  宝得利门窗 - Vercel一键部署${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  检测到未安装Vercel CLI，正在安装...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel CLI安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Vercel CLI安装成功${NC}"
fi

# 检查是否已登录Vercel
echo -e "${BLUE}🔐 检查Vercel登录状态...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  请先登录Vercel账号${NC}"
    vercel login
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel登录失败${NC}"
        exit 1
    fi
fi

USER=$(vercel whoami)
echo -e "${GREEN}✅ 已登录Vercel，用户：$USER${NC}"

# 预检查项目文件
echo -e "${BLUE}📋 检查项目文件...${NC}"

required_files=("vercel.json" "api/health.js" "client/package.json" "scripts/init-vercel-db.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 缺少必需文件: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ 项目文件检查完成${NC}"

# 构建前端
echo -e "${BLUE}🔨 构建前端应用...${NC}"
cd client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 前端依赖安装失败${NC}"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ 前端构建完成${NC}"

# 部署到Vercel
echo -e "${BLUE}🚀 开始部署到Vercel...${NC}"
vercel --prod --yes
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi

# 获取部署URL
DEPLOY_URL=$(vercel ls | grep -E "https://.*\.vercel\.app" | head -1 | awk '{print $2}')
if [ -z "$DEPLOY_URL" ]; then
    echo -e "${YELLOW}⚠️  无法自动获取部署URL，请手动检查Vercel Dashboard${NC}"
    DEPLOY_URL="your-app.vercel.app"
fi

echo -e "${GREEN}✅ 部署成功！${NC}"
echo -e "${GREEN}📍 部署地址：https://$DEPLOY_URL${NC}"

# 提示后续步骤
echo ""
echo -e "${YELLOW}📋 接下来请完成以下步骤：${NC}"
echo ""
echo -e "${BLUE}1. 创建PostgreSQL数据库：${NC}"
echo "   - 访问：https://vercel.com/dashboard"
echo "   - 进入项目 → Storage → Create Database"
echo "   - 选择 PostgreSQL"
echo "   - 数据库名称：baodeli-db"
echo ""
echo -e "${BLUE}2. 配置环境变量：${NC}"
echo "   - 进入项目 → Settings → Environment Variables"
echo "   - 添加以下变量："
echo "     JWT_SECRET=your-super-secret-jwt-key"
echo "     ADMIN_USERNAME=admin"
echo "     ADMIN_PASSWORD=your-secure-password"
echo "     DB_INIT_KEY=baodeli-init-2024"
echo ""
echo -e "${BLUE}3. 初始化数据库：${NC}"
echo "   - 等待环境变量配置完成"
echo "   - 运行数据库初始化："
echo ""
echo -e "${GREEN}curl -X POST https://$DEPLOY_URL/api/init-db \\${NC}"
echo -e "${GREEN}  -H \"Content-Type: application/json\" \\${NC}"
echo -e "${GREEN}  -d '{\"initKey\": \"baodeli-init-2024\"}'${NC}"
echo ""
echo -e "${BLUE}4. 验证部署：${NC}"
echo "   - 健康检查：https://$DEPLOY_URL/api/health"
echo "   - 前端页面：https://$DEPLOY_URL"
echo "   - 管理登录：https://$DEPLOY_URL/admin/login"
echo ""

# 询问是否自动打开浏览器
read -p "$(echo -e ${YELLOW}是否现在打开部署地址？[y/N]: ${NC})" open_browser
if [[ $open_browser =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://$DEPLOY_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://$DEPLOY_URL"
    else
        echo -e "${YELLOW}请手动打开：https://$DEPLOY_URL${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 部署脚本执行完成！${NC}"
echo -e "${BLUE}📖 详细部署指南请查看：VERCEL_DEPLOYMENT_COMPLETE_GUIDE.md${NC}"
echo ""
echo -e "${YELLOW}如遇问题，请检查Vercel Function Logs或联系技术支持${NC}" 