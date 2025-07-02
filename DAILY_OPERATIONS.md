# 宝得利门窗系统 - 日常操作指南

## 🚀 快速开始

恭喜！您的网站已成功部署到Vercel。以下是日常维护和更新的完整指南。

## 📋 可用工具

### 🔧 开发工具脚本
```bash
./dev-check.sh          # 检查开发环境配置
./quick-update.sh        # 快速更新和部署
./test-api.sh           # API功能测试
```

### 📁 重要文件
```bash
.env.local.example      # 环境变量示例
VERCEL_FULLSTACK_GUIDE.md # 完整部署指南
DAILY_OPERATIONS.md     # 本操作指南
```

## 🛠️ 日常开发流程

### Step 1: 开始开发
```bash
# 1. 检查开发环境
./dev-check.sh

# 2. 启动本地服务器
vercel dev
# 或者
npm run dev

# 3. 打开浏览器访问
# http://localhost:3000
```

### Step 2: 进行修改
```bash
# 前端修改 (Vue.js)
# 编辑文件: client/src/views/*.vue
# 编辑文件: client/src/components/*.vue
# 编辑文件: client/src/style.css

# 后端修改 (Serverless Functions)
# 编辑文件: api/**/*.js
# 编辑文件: lib/*.js
```

### Step 3: 测试验证
```bash
# 1. 前端测试
# 浏览器访问 http://localhost:3000

# 2. API测试
./test-api.sh

# 3. 构建测试
cd client && npm run build
```

### Step 4: 提交部署
```bash
# 快速方式
./quick-update.sh

# 手动方式
git add .
git commit -m "描述您的更改"
git push origin main
```

## 🎯 常见操作场景

### 📝 更新网站内容
```bash
# 1. 修改页面文件
vi client/src/views/Home.vue

# 2. 本地预览
vercel dev

# 3. 提交更新
./quick-update.sh
# 选择: feat - 新功能
# 输入描述: 更新首页产品展示
```

### 🐛 修复问题
```bash
# 1. 定位问题
# 查看 Vercel Dashboard 日志
# 或本地复现问题

# 2. 修复代码
vi client/src/views/Cart.vue

# 3. 测试修复
vercel dev

# 4. 紧急部署
./quick-update.sh
# 选择: fix - Bug修复
# 输入描述: 修复购物车计算错误
```

### 🎨 样式调整
```bash
# 1. 修改样式
vi client/src/style.css

# 2. 预览效果
vercel dev

# 3. 提交更改
./quick-update.sh
# 选择: style - 样式更新
# 输入描述: 优化移动端布局
```

### ⚙️ 添加新功能
```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发功能
# 添加新页面、API等

# 3. 测试功能
vercel dev
./test-api.sh

# 4. 合并到主分支
git checkout main
git merge feature/new-feature

# 5. 部署
./quick-update.sh
```

## 🔧 环境配置

### 本地开发环境
```bash
# 1. 复制环境变量示例
cp .env.local.example .env.local

# 2. 编辑环境变量
vi .env.local

# 3. 安装依赖 (如果需要)
npm install
cd client && npm install
```

### 生产环境变量
```bash
# 在 Vercel Dashboard 中设置:
# https://vercel.com/dashboard
# 项目设置 > Environment Variables

# 必需变量:
# - JWT_SECRET
# - ADMIN_USERNAME
# - ADMIN_PASSWORD
# - POSTGRES_URL (自动设置)
```

## 📊 监控和维护

### 部署状态检查
```bash
# 查看部署历史
vercel ls

# 查看实时日志
vercel logs --follow

# 检查API状态
./test-api.sh
```

### 性能监控
- 📈 **Vercel Analytics**: 查看访问数据
- 🚨 **错误监控**: 关注错误日志
- 💰 **资源使用**: 监控免费额度

### 定期维护
```bash
# 每周检查:
# 1. 更新依赖包
npm update
cd client && npm update

# 2. 检查安全更新
npm audit

# 3. 清理未使用的文件
# 4. 备份重要数据
```

## 🚨 紧急处理

### 快速回滚
```bash
# 方式1: Vercel Dashboard
# 1. 访问 https://vercel.com/dashboard
# 2. 选择项目 > 部署历史
# 3. 找到稳定版本 > "Promote to Production"

# 方式2: Git回滚
git log --oneline -10
git reset --hard <stable-commit>
git push -f origin main  # 谨慎使用
```

### 问题排查
```bash
# 1. 检查部署日志
vercel logs

# 2. 测试API功能
./test-api.sh

# 3. 检查环境配置
./dev-check.sh

# 4. 验证代码语法
cd client && npm run build
```

## 💡 最佳实践

### 代码管理
- ✅ 使用描述性的提交信息
- ✅ 定期创建功能分支
- ✅ 测试后再部署
- ✅ 保持代码整洁

### 性能优化
- 🎯 优化图片大小
- 🎯 使用缓存策略
- 🎯 监控API响应时间
- 🎯 定期清理日志

### 安全考虑
- �� 定期更新密码
- 🔒 监控访问日志
- 🔒 及时修复安全漏洞
- 🔒 备份重要数据

## 📞 支持资源

### 文档链接
- [Vercel官方文档](https://vercel.com/docs)
- [Vue.js官方文档](https://vuejs.org/)
- [Tailwind CSS文档](https://tailwindcss.com/)

### 常用命令速查
```bash
# 本地开发
vercel dev                    # 启动本地服务器
./dev-check.sh               # 检查开发环境
./test-api.sh                # 测试API
./quick-update.sh            # 快速更新

# Git操作
git status                   # 查看状态
git add .                    # 添加文件
git commit -m "message"      # 提交更改
git push origin main         # 推送到远程

# 构建和部署
cd client && npm run build   # 构建前端
vercel --prod                # 部署到生产环境
```

---

🎉 **恭喜！您现在拥有了完整的网站管理能力！**

通过这些工具和指南，您可以轻松地维护和扩展您的宝得利门窗系统。如有任何问题，请参考详细文档或寻求技术支持。
