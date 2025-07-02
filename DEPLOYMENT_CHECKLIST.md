# Vercel全栈部署清单

## ✅ 准备工作
- [x] 环境依赖检查完成
- [x] 项目依赖安装完成
- [x] 前端构建完成
- [x] API结构验证完成
- [x] 环境变量模板生成完成

## 🔄 下一步操作

### 1. GitHub仓库准备
```bash
git add .
git commit -m "重构为Vercel Serverless Functions"
git push origin main
```

### 2. Vercel项目创建
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入GitHub仓库
4. 保持默认设置

### 3. 数据库配置
1. 在Vercel项目中点击 "Storage"
2. 创建 PostgreSQL 数据库
3. 复制连接字符串

### 4. 环境变量设置
在Vercel项目设置中添加：
- JWT_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD

### 5. 数据迁移（如有数据）
```bash
export POSTGRES_URL="vercel-postgres://..."
npm run migrate
```

### 6. 部署验证
```bash
# 测试API
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/products
```

## 🎯 本地开发
```bash
# 启动本地开发服务器
vercel dev
```

访问 http://localhost:3000 测试应用
