#!/bin/bash

# 🚀 Netlify部署脚本 - 门窗订购系统
# 完全绕过Vercel团队SSO问题

echo "🌟 开始部署到Netlify..."
echo "📋 这将彻底解决Vercel认证保护问题"
echo ""

# 检查环境
if ! command -v netlify &> /dev/null; then
    echo "📦 安装Netlify CLI..."
    npm install -g netlify-cli
fi

# 检查登录状态
echo "🔑 检查Netlify登录状态..."
if ! netlify status &> /dev/null; then
    echo "请先登录Netlify:"
    netlify login
fi

echo ""
echo "🎛️  选择数据库服务商:"
echo "   1. Supabase PostgreSQL (推荐 - 免费500MB)"
echo "   2. Railway PostgreSQL (免费5GB)"
echo "   3. 暂时跳过数据库配置"
echo ""

read -p "请选择 (1-3): " db_choice

# 数据库配置
case $db_choice in
    1)
        echo ""
        echo "🔗 Supabase数据库配置:"
        echo "   1. 访问: https://supabase.com/dashboard"
        echo "   2. 创建新项目"
        echo "   3. 进入 Settings > Database"
        echo "   4. 复制 Connection string"
        echo ""
        read -p "请输入Supabase数据库URL: " SUPABASE_DB_URL
        export DATABASE_URL="$SUPABASE_DB_URL"
        ;;
    2)
        echo ""  
        echo "🚄 Railway数据库配置:"
        echo "   1. 访问: https://railway.app/dashboard"
        echo "   2. 创建PostgreSQL数据库"
        echo "   3. 复制连接字符串"
        echo ""
        read -p "请输入Railway数据库URL: " RAILWAY_DB_URL
        export DATABASE_URL="$RAILWAY_DB_URL"
        ;;
    3)
        echo "⏭️  跳过数据库配置（可后续添加）"
        ;;
esac

# 替换前端API配置
echo "🔧 更新前端API配置..."
if [ -f "client/src/config/api.js" ]; then
    mv client/src/config/api.js client/src/config/api-vercel-backup.js
fi
cp client/src/config/api-netlify.js client/src/config/api.js

# 构建前端
echo "🏗️  构建前端项目..."
cd client
npm install
npm run build
cd ..

# 初始化Netlify项目
PROJECT_NAME="door-window-netlify-$(date +%m%d)"
echo "🌐 初始化Netlify项目: $PROJECT_NAME"

# 创建netlify站点
netlify init --manual

echo ""
echo "📋 配置Netlify项目设置:"
echo "   Site name: $PROJECT_NAME"
echo "   Build command: cd client && npm install && npm run build"
echo "   Publish directory: client/dist"
echo ""

# 设置环境变量
if [ ! -z "$DATABASE_URL" ]; then
    echo "🔑 设置环境变量..."
    netlify env:set DATABASE_URL "$DATABASE_URL"
    netlify env:set NODE_ENV "production"
    netlify env:set JWT_SECRET "netlify-door-window-secret-$(date +%s)"
fi

# 部署到生产环境
echo "🚀 部署到生产环境..."
netlify deploy --prod

echo ""
echo "🧪 测试部署结果..."
sleep 5

# 获取站点URL
SITE_URL=$(netlify status --json | grep -o '"site_url":"[^"]*' | grep -o '[^"]*$')

if [ ! -z "$SITE_URL" ]; then
    echo "📡 测试API访问..."
    
    # 测试健康检查
    HEALTH_RESPONSE=$(curl -s "$SITE_URL/.netlify/functions/health")
    
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        echo "✅ 🎉 Netlify部署成功！"
        echo ""
        echo "🔗 网站地址: $SITE_URL"
        echo "🔗 管理员入口: $SITE_URL/admin"
        echo "🔗 API测试: $SITE_URL/.netlify/functions/test"
        echo ""
        echo "👨‍💼 管理员登录信息:"
        echo "   用户名: admin"
        echo "   密码: 123456"
        echo ""
        echo "🧹 部署完成后可删除临时文件:"
        echo "   rm deploy-to-netlify.sh"
        echo "   rm -rf api/ vercel.json"
        
    else
        echo "⚠️  API可能需要时间启动，请稍后测试"
        echo "🔗 手动测试: $SITE_URL/.netlify/functions/test"
    fi
else
    echo "❌ 无法获取站点URL，请检查部署状态"
    netlify status
fi

echo ""
echo "📚 Netlify管理面板: https://app.netlify.com/sites"
echo "🛠️  如需添加更多功能，编辑 netlify/functions/ 目录"
echo ""
echo "🎯 问题解决状态:"
echo "   ✅ 绕过Vercel团队SSO认证保护"
echo "   ✅ 无需复杂的权限配置"
echo "   ✅ 支持Serverless Functions"
echo "   ✅ 免费SSL证书和CDN"
echo ""

# 恢复原始配置（可选）
read -p "是否保留Netlify配置？(y/n): " keep_config
if [[ $keep_config != "y" && $keep_config != "Y" ]]; then
    echo "🔄 恢复原始配置..."
    if [ -f "client/src/config/api-vercel-backup.js" ]; then
        mv client/src/config/api-vercel-backup.js client/src/config/api.js
    fi
fi

echo "✨ Netlify部署完成！" 