# 🚪 门窗订购系统 - Netlify版

基于Vue.js + Netlify Functions的现代化门窗订购管理系统。

## 🌟 特性

- ✅ **Vue 3 + Composition API** - 现代化前端框架
- ✅ **Netlify Functions** - Serverless后端API
- ✅ **PostgreSQL数据库** - 支持Supabase/Railway
- ✅ **响应式设计** - 移动端友好
- ✅ **管理后台** - 产品、订单、用户管理
- ✅ **无认证限制** - 彻底解决Vercel团队SSO问题

## 🚀 快速开始

### 一键部署
```bash
./start-netlify.sh
```

### 手动部署
```bash
# 1. 安装Netlify CLI
npm install -g netlify-cli

# 2. 登录Netlify
netlify login

# 3. 运行部署脚本
./deploy-to-netlify.sh
```

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
netlify dev

# 访问应用
# 前端: http://localhost:8888
# Functions: http://localhost:8888/.netlify/functions/
```

## 📊 数据库配置

支持以下PostgreSQL服务：

### Supabase (推荐)
- 免费500MB存储
- 注册：https://supabase.com/dashboard

### Railway
- 免费5GB存储
- 注册：https://railway.app/dashboard

### 环境变量
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
JWT_SECRET=your-secret-key
```

## 🎯 访问系统

部署后访问：
- 🌐 **主页**: `https://your-site.netlify.app`
- 👨‍💼 **管理后台**: `https://your-site.netlify.app/admin`
- 🔧 **API测试**: `https://your-site.netlify.app/.netlify/functions/test`

### 管理员登录
- **用户名**: `admin`
- **密码**: `123456`

## 📁 项目结构

```
├── client/                 # Vue.js前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/         # 页面
│   │   └── config/        # 配置
│   └── dist/              # 构建输出
├── netlify/
│   └── functions/         # Netlify Functions
│       ├── lib/           # 共享库
│       ├── health.js      # 健康检查
│       ├── test.js        # 测试API
│       ├── products.js    # 产品管理
│       └── admin-login.js # 管理员登录
├── uploads/               # 上传文件
├── netlify.toml          # Netlify配置
└── package.json          # 项目配置
```

## 🛠️ API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/test` | GET | 测试API |
| `/products` | GET/POST | 产品管理 |
| `/admin-login` | POST | 管理员登录 |

## 🔒 安全特性

- JWT认证机制
- CORS安全配置
- 输入验证和过滤
- SQL注入防护
- HTTPS强制加密

## 🚀 部署优势

相比Vercel，Netlify方案具有以下优势：

| 功能 | Vercel | Netlify |
|------|--------|---------|
| 认证保护 | ❌ 团队SSO强制 | ✅ 无限制 |
| 部署简易度 | ❌ 复杂配置 | ✅ 一键部署 |
| 免费Functions | ❌ 100k/月 | ✅ 125k/月 |
| 冷启动时间 | 🔶 ~500ms | ✅ ~300ms |

## 📚 文档

- [部署指南](NETLIFY_GUIDE.md)
- [日常操作](日常操作.md)
- [更新指南](更新指南.md)

## 🆘 问题排查

### 常见问题
1. **API 404错误**: 检查netlify.toml配置
2. **数据库连接失败**: 验证环境变量
3. **构建失败**: 检查依赖安装

### 获取帮助
- 查看Netlify部署日志
- 检查Functions日志
- 联系技术支持

## 📄 许可证

MIT License

---

🎉 **恭喜！您已成功摆脱Vercel团队SSO限制，享受无障碍的部署体验！** 