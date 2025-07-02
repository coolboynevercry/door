# 🚀 快速部署修复指南

## 当前状态
您的Vercel CLI正在等待回应。请按照以下步骤操作：

### Step 1: 回答Vercel CLI的问题

在终端中，您会看到这些问题，请按顺序回答：

```
? Set up and deploy "~/Desktop/codeSet/门窗店/宝得利订购网站"? (Y/n) 
👉 输入: y

? Which scope do you want to deploy to?
👉 选择您的用户名 (coolboynevercry)

? What's your project's name?
👉 输入: baodeli-windows (或保持默认)

? In which directory is your code located?
👉 按回车 (使用当前目录)
```

### Step 2: 等待部署完成
- Vercel会自动检测为Next.js项目
- 构建并部署您的应用
- 提供一个https://xxx.vercel.app的URL

### Step 3: 部署后配置

1. **创建数据库**
   - 访问: https://vercel.com/dashboard
   - 进入您的项目 → Storage → Create Database
   - 选择PostgreSQL，名称: baodeli-db

2. **配置环境变量**
   - 项目 → Settings → Environment Variables
   - 添加:
     ```
     JWT_SECRET=your-super-secret-jwt-key
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=your-secure-password
     DB_INIT_KEY=baodeli-init-2024
     ```

3. **初始化数据库**
   ```bash
   curl -X POST https://your-app.vercel.app/api/init-db \
     -H "Content-Type: application/json" \
     -d '{"initKey": "baodeli-init-2024"}'
   ```

## ✅ 成功标志
- 前端页面可以访问
- 管理员登录: https://your-app.vercel.app/admin/login
- 用户名: admin, 密码: 123456

