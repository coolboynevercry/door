# 🚀 Netlify部署指南 - 门窗订购系统

## 📋 为什么选择Netlify？

由于Vercel团队SSO认证保护问题，我们转用**Netlify**：

- ✅ **无认证保护问题** - 没有复杂的团队权限限制
- ✅ **免费Serverless Functions** - 125,000次/月免费调用
- ✅ **自动SSL和CDN** - 全球CDN加速
- ✅ **简单部署流程** - 一键部署，无复杂配置

## 🚀 一键部署

```bash
# 1. 给脚本执行权限
chmod +x deploy-to-netlify.sh

# 2. 运行部署脚本
./deploy-to-netlify.sh
```

脚本会自动处理：
- 安装Netlify CLI
- 配置数据库连接 
- 构建前端项目
- 部署到Netlify
- 测试API功能

## 📊 数据库选择

### Supabase (推荐)
- 免费500MB存储
- 完整PostgreSQL功能
- 注册：https://supabase.com/dashboard

### Railway
- 免费5GB存储 
- 一键PostgreSQL部署
- 注册：https://railway.app/dashboard

## 🧪 部署后测试

访问您的Netlify站点：
- 🌐 **主页**: `https://your-site.netlify.app`
- 👨‍💼 **管理后台**: `https://your-site.netlify.app/admin`
- 🔧 **API测试**: `https://your-site.netlify.app/.netlify/functions/test`

### 管理员登录信息
- **用户名**: `admin`
- **密码**: `123456`

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动本地服务器
netlify dev

# 访问 http://localhost:8888
```

## 📁 项目结构
```
netlify/
├── functions/          # Netlify Functions
│   ├── lib/database.js # 数据库连接
│   ├── health.js       # 健康检查
│   ├── test.js         # 测试API
│   ├── products.js     # 产品管理
│   └── admin-login.js  # 管理员登录
└── netlify.toml        # Netlify配置
```

## ✅ 成功标志

部署成功后，您应该看到：
- ✅ Netlify站点正常访问
- ✅ API返回正常JSON（不是认证页面）
- ✅ 管理员登录成功
- ✅ 数据库连接正常

---

🎉 **Netlify方案彻底解决了Vercel团队SSO认证保护问题！** 