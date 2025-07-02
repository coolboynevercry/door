 #!/bin/bash

# 宝得利门窗订购网站后端启动脚本

echo "🚀 正在启动宝得利门窗API服务器..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未安装 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖包..."
    npm install
fi

# 检查端口 3000 是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告：端口 3000 已被占用"
    echo "请停止占用端口 3000 的进程，或修改 server.js 中的端口号"
    exit 1
fi

# 启动服务器
echo "🌟 启动服务器..."
node server.js 