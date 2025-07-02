# 数据库设置指南

## 预备条件

### 1. 安装 MySQL
确保你的系统已安装 MySQL 8.0+

**macOS (使用 Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**Windows:**
下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

### 2. 创建数据库
登录 MySQL 并创建数据库：

```sql
mysql -u root -p

CREATE DATABASE baodeli_windows CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（可选，推荐）
CREATE USER 'baodeli_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON baodeli_windows.* TO 'baodeli_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 3. 配置环境变量
编辑 `.env` 文件，设置数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=baodeli_windows
DB_USER=root           # 或你创建的用户名
DB_PASSWORD=           # 你的密码

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development

ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
npm run init-db
```

### 3. 启动服务器
```bash
npm run dev
```

## 可用的数据库脚本

- `npm run init-db` - 初始化数据库并插入示例数据
- `npm run db:sync` - 同步数据库结构（不删除数据）
- `npm run db:reset` - 重置数据库（⚠️ 会删除所有数据）

## API 接口说明

### 认证接口
- `POST /api/admin/login` - 管理员登录

### 商品接口（部分需要认证）
- `GET /api/products` - 获取商品列表 ✅ 公开
- `GET /api/products/:id` - 获取商品详情 ✅ 公开
- `POST /api/products` - 添加商品 🔒 需要管理员认证
- `PUT /api/products/:id` - 更新商品 🔒 需要管理员认证
- `DELETE /api/products/:id` - 删除商品 🔒 需要管理员认证

### 订单接口（部分需要认证）
- `POST /api/orders` - 创建订单 ✅ 公开
- `GET /api/orders` - 获取订单列表 🔒 需要管理员认证
- `PUT /api/orders/:id` - 更新订单状态 🔒 需要管理员认证

## 认证说明

需要认证的接口需要在请求头中包含 JWT token：

```
Authorization: Bearer your_jwt_token
```

管理员登录成功后会返回 token，前端需要保存并在后续请求中携带。

## 故障排除

### 1. 数据库连接失败
- 检查 MySQL 服务是否启动
- 验证 `.env` 文件中的数据库配置
- 确认数据库和用户已创建

### 2. 权限错误
- 确保数据库用户有足够的权限
- 检查防火墙设置

### 3. 端口冲突
- 修改 `.env` 文件中的 PORT 配置
- 检查 3306 端口是否被占用

