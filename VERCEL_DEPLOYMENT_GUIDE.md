# 宝得利门窗系统 - Vercel部署指南

## 🚨 部署前必须解决的问题

### 1. 数据库迁移（重要！）

**当前问题**：使用SQLite本地数据库，Vercel不支持
**解决方案**：迁移到云数据库

#### 推荐方案：Vercel Postgres
```bash
# 1. 在Vercel项目中创建数据库
# 2. 获取数据库连接字符串
# 3. 修改数据库配置

# 更新 server/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

#### 数据迁移步骤
```bash
# 1. 导出现有数据
sqlite3 server/database.sqlite .dump > data_backup.sql

# 2. 转换SQL格式（SQLite -> PostgreSQL）
# 手动调整数据类型和语法差异

# 3. 导入到新数据库
psql $DATABASE_URL < converted_data.sql
```

### 2. 文件存储迁移

**当前问题**：文件存储在本地 `server/uploads/`
**解决方案**：使用Vercel Blob Storage

```bash
# 安装Vercel Blob SDK
npm install @vercel/blob

# 更新上传逻辑
const { put } = require('@vercel/blob');

// 替换文件上传代码
const blob = await put(filename, file, {
  access: 'public',
});
```

### 3. 环境变量配置

在Vercel项目设置中添加：
```env
# 数据库
DATABASE_URL=your_postgres_connection_string

# JWT密钥
JWT_SECRET=your-super-secret-key

# 文件存储
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# 管理员认证
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

## 📋 部署步骤

### 方案一：仅前端部署（推荐新手）

```bash
# 1. 部署前端到Vercel
cd client
vercel --prod

# 2. 后端部署到其他平台
# - Railway (推荐): railway.app
# - Render: render.com
# - DigitalOcean App Platform

# 3. 更新前端API地址
# 修改 client/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-url.com',
        changeOrigin: true
      }
    }
  }
})
```

### 方案二：全栈部署（高级）

```bash
# 1. 重构后端为Serverless Functions
mkdir api
# 将 server/routes 下的每个路由文件转换为 api/ 下的函数

# 2. 部署整个项目
vercel --prod
```

## 🔄 API重构示例

将Express路由转换为Vercel API Routes：

```javascript
// api/products.js
import { createConnection } from '../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await createConnection();
      const products = await db.query('SELECT * FROM products');
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
```

## 📦 依赖更新

```bash
# 添加生产环境依赖
npm install --save @vercel/postgres @vercel/blob

# 更新package.json
{
  "engines": {
    "node": "18.x"
  }
}
```

## 🔧 代码修改清单

### 1. 数据库配置
- [ ] 更新 `server/config/database.js`
- [ ] 修改模型定义（如果使用PostgreSQL）
- [ ] 更新数据同步逻辑

### 2. 文件上传
- [ ] 修改 `server/routes/upload.js`
- [ ] 更新合同图片存储逻辑
- [ ] 更新产品图片上传

### 3. 前端配置
- [ ] 更新API基础URL
- [ ] 修改代理配置
- [ ] 添加生产环境检测

### 4. 认证系统
- [ ] 确保JWT密钥从环境变量读取
- [ ] 更新CORS配置

## 🚀 部署命令

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 初始化项目
vercel

# 4. 部署
vercel --prod
```

## ⚠️ 重要注意事项

### 性能考虑
- Serverless函数有冷启动延迟
- 数据库连接需要使用连接池
- 大文件上传需要特殊处理

### 成本考虑
- Vercel免费版有限制
- 数据库和存储费用
- 流量费用

### 监控和维护
- 配置错误监控
- 设置日志收集
- 备份重要数据

## 📞 迁移建议

对于您的项目，我建议：

1. **阶段性迁移**：先部署前端，后端保留本地开发
2. **数据库优先**：先解决数据库迁移问题
3. **逐步替换**：逐个API转换为Serverless
4. **充分测试**：每个功能都要仔细测试

需要帮助具体实施任何步骤吗？ 