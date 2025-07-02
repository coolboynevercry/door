const fs = require('fs');
const path = require('path');

console.log('🚀 准备Vercel部署...\n');

// 1. 检查必要文件
console.log('1️⃣ 检查项目文件...');
const requiredFiles = [
  'client/package.json',
  'server/package.json',
  'server/config/database.js',
  'vercel.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - 缺失！`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分必要文件缺失，请检查后重新运行');
  process.exit(1);
}

// 2. 构建前端
console.log('\n2️⃣ 构建前端项目...');
const { execSync } = require('child_process');

try {
  process.chdir('client');
  console.log('   安装依赖...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('   构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  
  if (fs.existsSync('dist')) {
    console.log('   ✅ 前端构建成功');
  } else {
    throw new Error('构建失败：dist目录不存在');
  }
  
  process.chdir('..');
} catch (error) {
  console.log(`   ❌ 前端构建失败: ${error.message}`);
  process.exit(1);
}

// 3. 导出数据
console.log('\n3️⃣ 导出数据库数据...');
try {
  const { exportData } = require('./server/scripts/exportData');
  // 注意：这里需要用户手动运行导出脚本
  console.log('   ⚠️  请手动运行: cd server && node scripts/exportData.js');
} catch (error) {
  console.log('   ⚠️  数据导出脚本准备就绪，请手动运行');
}

// 4. 创建环境变量模板
console.log('\n4️⃣ 创建环境变量模板...');
const envTemplate = `# Vercel环境变量配置模板
# 请在Vercel项目设置中添加以下环境变量

# 数据库配置（必需）
DATABASE_URL=postgresql://username:password@hostname:port/database

# JWT密钥（必需）
JWT_SECRET=your-super-secret-jwt-key

# 管理员认证（必需）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# 文件存储（如使用Vercel Blob）
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# 环境标识
NODE_ENV=production
`;

fs.writeFileSync('.env.vercel.template', envTemplate);
console.log('   ✅ 环境变量模板已创建: .env.vercel.template');

// 5. 检查需要迁移的功能
console.log('\n5️⃣ 检查需要特殊处理的功能...');

const warnings = [];

// 检查Canvas依赖
if (fs.existsSync('server/package.json')) {
  const serverPackage = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  if (serverPackage.dependencies && serverPackage.dependencies.canvas) {
    warnings.push('⚠️  Canvas库在Vercel上可能需要特殊配置');
  }
  
  if (serverPackage.dependencies && serverPackage.dependencies.multer) {
    warnings.push('⚠️  文件上传需要迁移到云存储服务');
  }
}

// 检查上传文件夹
if (fs.existsSync('server/uploads') && fs.readdirSync('server/uploads').length > 0) {
  warnings.push('⚠️  uploads文件夹需要迁移到云存储');
}

if (warnings.length > 0) {
  console.log('   需要注意的问题:');
  warnings.forEach(warning => console.log(`   ${warning}`));
} else {
  console.log('   ✅ 未发现明显问题');
}

// 6. 生成部署清单
console.log('\n6️⃣ 生成部署清单...');
const checklist = `# Vercel部署清单

## 部署前准备 ✅
- [x] 项目文件检查完成
- [x] 前端构建成功
- [x] 环境变量模板已创建
- [ ] 数据库数据已导出 (运行: cd server && node scripts/exportData.js)

## Vercel平台配置 ⬜
- [ ] 创建Vercel项目
- [ ] 连接GitHub仓库
- [ ] 创建PostgreSQL数据库
- [ ] 配置环境变量 (参考 .env.vercel.template)
- [ ] 设置构建配置

## 数据迁移 ⬜
- [ ] 导出SQLite数据
- [ ] 转换数据格式 (SQLite → PostgreSQL)
- [ ] 导入数据到新数据库
- [ ] 验证数据完整性

## 功能迁移 ⬜
- [ ] 文件上传迁移到云存储
- [ ] 图片路径更新
- [ ] API接口测试
- [ ] 认证功能测试

## 后端选择 ⬜
选择以下一种方式：

### 方案A: 分离部署 (推荐)
- [ ] 前端部署到Vercel
- [ ] 后端部署到Railway/Render
- [ ] 更新前端API地址

### 方案B: 全栈部署 (高级)
- [ ] 重构Express路由为Vercel API Routes
- [ ] 处理Serverless函数限制
- [ ] 测试冷启动性能

## 上线验证 ⬜
- [ ] 用户注册登录
- [ ] 商品浏览
- [ ] 订单创建
- [ ] 管理后台
- [ ] 文件上传
- [ ] 性能测试

---
📝 注意：建议先使用方案A进行分离部署，等功能稳定后再考虑方案B
`;

fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
console.log('   ✅ 部署清单已创建: DEPLOYMENT_CHECKLIST.md');

// 7. 最终提示
console.log('\n🎉 部署准备完成！');
console.log('\n📋 下一步操作：');
console.log('1. 查看部署清单: DEPLOYMENT_CHECKLIST.md');
console.log('2. 导出数据: cd server && node scripts/exportData.js');
console.log('3. 在Vercel中创建项目并配置数据库');
console.log('4. 配置环境变量 (参考 .env.vercel.template)');
console.log('5. 推送代码到GitHub并触发部署');

console.log('\n💡 建议：');
console.log('- 先尝试分离部署（前端用Vercel，后端用Railway）');
console.log('- 确保在本地完整测试所有功能');
console.log('- 备份重要数据后再进行迁移'); 