#!/bin/bash

# 宝得利门窗系统 - 开发环境检查脚本

echo "🔧 宝得利门窗系统 - 开发环境检查"
echo "================================="

# 检查Node.js
echo ""
echo "📋 检查开发环境..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js: $node_version"
else
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "✅ npm: $npm_version"
else
    echo "❌ npm 未安装"
    exit 1
fi

# 检查Git
if command -v git &> /dev/null; then
    git_version=$(git --version)
    echo "✅ Git: $git_version"
else
    echo "❌ Git 未安装"
    exit 1
fi

# 检查Vercel CLI
if command -v vercel &> /dev/null; then
    vercel_version=$(vercel --version)
    echo "✅ Vercel CLI: $vercel_version"
else
    echo "⚠️  Vercel CLI 未安装"
    echo "   安装命令: npm install -g vercel"
fi

# 检查项目依赖
echo ""
echo "📦 检查项目依赖..."

if [ -f "package.json" ]; then
    echo "✅ 根目录 package.json 存在"
    if [ -d "node_modules" ]; then
        echo "✅ 根目录依赖已安装"
    else
        echo "⚠️  根目录依赖未安装，运行: npm install"
    fi
else
    echo "❌ 根目录 package.json 不存在"
fi

if [ -f "client/package.json" ]; then
    echo "✅ 前端 package.json 存在"
    if [ -d "client/node_modules" ]; then
        echo "✅ 前端依赖已安装"
    else
        echo "⚠️  前端依赖未安装，运行: cd client && npm install"
    fi
else
    echo "❌ 前端 package.json 不存在"
fi

# 检查关键文件
echo ""
echo "📄 检查关键文件..."

key_files=(
    "vercel.json"
    "lib/database.js"
    "lib/auth.js"
    "api/health.js"
    "client/src/main.js"
    "client/src/App.vue"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
    fi
done

# 检查环境变量
echo ""
echo "🔐 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
else
    echo "⚠️  .env.local 文件不存在"
    echo "   创建示例: cp .env.local.example .env.local"
fi

# 检查Git仓库
echo ""
echo "📊 检查Git仓库状态..."
if [ -d ".git" ]; then
    echo "✅ Git仓库已初始化"
    
    if git remote -v | grep -q "origin"; then
        remote_url=$(git remote get-url origin)
        echo "✅ 远程仓库: $remote_url"
    else
        echo "⚠️  未设置远程仓库"
    fi
    
    branch=$(git branch --show-current)
    echo "📝 当前分支: $branch"
    
    if [[ -n $(git status --porcelain) ]]; then
        echo "⚠️  有未提交的更改"
    else
        echo "✅ 工作区干净"
    fi
else
    echo "❌ 不是Git仓库"
fi

echo ""
echo "🎯 建议操作:"
echo "   1. 本地开发: vercel dev"
echo "   2. 构建测试: cd client && npm run build"
echo "   3. 快速更新: ./quick-update.sh"
echo "   4. API测试: ./test-api.sh"

