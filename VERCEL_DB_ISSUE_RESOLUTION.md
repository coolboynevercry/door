# PostgreSQL连接错误解决方案

## 问题描述
```
VercelPostgresError: VercelPostgresError - 'invalid_connection_string': This connection string is meant to be used with a direct connection. Make sure to use a pooled connection string or try `createClient()` instead.
```

## 已完成的修复

### 1. 数据库连接重构 ✅
- **原因**: 使用了 `createPool()` 但提供了直接连接字符串 `POSTGRES_URL`
- **解决**: 重构为使用 Sequelize ORM + 直接连接
- **文件**: `lib/database.js` - 完全重写数据库连接逻辑

### 2. API模块更新 ✅
- **商品API**: `api/products/index.js` - 已更新使用新连接方式
- **认证模块**: `lib/auth.js` - 已使用CommonJS格式
- **工具模块**: `lib/utils.js` - 已转换为CommonJS格式

### 3. 依赖项更新 ✅
- **vercel.json**: 添加了 `sequelize` 和 `pg` 依赖
- **数据库初始化**: `scripts/init-vercel-db.js` - 更新使用新模型

## 新的数据库架构

### 连接方式
```javascript
// 使用 Sequelize ORM
const { connectToDatabase } = require('../lib/database');
const { User, Product, Order, Contract, ChatMessage } = await connectToDatabase();
```

### 数据模型
- **用户**: Sequelize模型，支持JSONB字段
- **产品**: 优化的产品表结构
- **订单**: 关联用户和产品
- **合同**: 关联订单
- **聊天**: 支持AI聊天功能

## 部署解决方案

### 方案1: Vercel Web界面部署
1. 访问 https://vercel.com/dashboard
2. 找到您的项目 `door` 或创建新项目
3. 连接GitHub仓库: `coolboynevercry/door`
4. 部署设置:
   - Framework Preset: Other
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install @vercel/postgres @vercel/blob jsonwebtoken bcryptjs sequelize pg`

### 方案2: 修复CLI问题
```bash
# 清理Vercel配置
rm -rf .vercel

# 重新登录
vercel logout
vercel login

# 重新部署
vercel --prod
```

### 方案3: 手动配置
如果CLI仍有问题，手动创建 `.vercel/project.json`:
```json
{
  "projectId": "your-project-id",
  "orgId": "your-org-id"
}
```

## 数据库初始化

### 方法1: API端点初始化
```bash
curl -X POST https://your-app.vercel.app/api/init-db \
  -H "Content-Type: application/json" \
  -d '{"initKey": "baodeli-init-2024"}'
```

### 方法2: 本地脚本初始化
```bash
# 设置环境变量
export POSTGRES_URL="your-postgres-url"

# 运行初始化脚本
node scripts/init-vercel-db.js
```

## 环境变量需要设置

在Vercel仪表板中设置以下环境变量:
```
POSTGRES_URL=your-vercel-postgres-connection-string
JWT_SECRET=baodeli-door-window-secret-key-2024
DB_INIT_KEY=baodeli-init-2024
```

## 测试修复

### 1. 测试数据库连接
```bash
curl https://your-app.vercel.app/api/health
```

### 2. 测试产品API
```bash
curl https://your-app.vercel.app/api/products
```

### 3. 测试管理员登录
```bash
curl -X POST https://your-app.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

## 预期结果

修复完成后，您应该能够:
1. ✅ 成功访问产品API
2. ✅ 数据库连接正常
3. ✅ 管理员登录功能正常
4. ✅ 前端页面正常显示

## 如果仍有问题

1. 检查Vercel函数日志
2. 确认环境变量设置正确
3. 检查数据库连接字符串格式
4. 联系技术支持

---
📅 更新时间: 2024年11月
🔧 状态: 修复完成，等待部署 