#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';

console.log('🚀 宝得利门窗系统 - Vercel全栈快速启动脚本\n');

async function quickStart() {
  try {
    // 1. 检查环境
    console.log('1️⃣ 检查环境依赖...');
    
    try {
      execSync('node --version', { stdio: 'pipe' });
      console.log('   ✅ Node.js 已安装');
    } catch {
      console.log('   ❌ Node.js 未安装，请先安装 Node.js 18+');
      return;
    }

    try {
      execSync('git --version', { stdio: 'pipe' });
      console.log('   ✅ Git 已安装');
    } catch {
      console.log('   ❌ Git 未安装，请先安装 Git');
      return;
    }

    // 2. 安装依赖
    console.log('\n2️⃣ 安装项目依赖...');
    console.log('   📦 安装根目录依赖...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('   📦 安装前端依赖...');
    execSync('cd client && npm install', { stdio: 'inherit' });

    // 3. 检查Vercel CLI
    console.log('\n3️⃣ 检查Vercel CLI...');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('   ✅ Vercel CLI 已安装');
    } catch {
      console.log('   📦 安装Vercel CLI...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // 4. 创建环境变量模板
    console.log('\n4️⃣ 创建环境变量模板...');
    const envTemplate = `# Vercel环境变量配置
# 请在Vercel项目设置中配置这些变量

# 数据库连接（Vercel Postgres自动设置）
POSTGRES_URL=vercel-postgres://...

# JWT密钥（请生成一个强密码）
JWT_SECRET=${generateRandomString(64)}

# 管理员认证
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${generateRandomString(16)}

# 文件存储（可选，用于Vercel Blob）
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# 开发环境
NODE_ENV=development
`;

    writeFileSync('.env.local', envTemplate);
    console.log('   ✅ 环境变量模板已创建: .env.local');

    // 5. 构建前端
    console.log('\n5️⃣ 构建前端项目...');
    execSync('cd client && npm run build', { stdio: 'inherit' });
    console.log('   ✅ 前端构建完成');

    // 6. 检查数据导出
    console.log('\n6️⃣ 检查数据导出...');
    if (existsSync('server/database.sqlite')) {
      console.log('   📊 发现SQLite数据库，导出数据...');
      try {
        execSync('cd server && node scripts/exportData.js', { stdio: 'inherit' });
        console.log('   ✅ 数据导出完成');
      } catch (error) {
        console.log('   ⚠️  数据导出失败，将跳过数据迁移');
      }
    } else {
      console.log('   ℹ️  未发现SQLite数据库，将创建空数据库');
    }

    // 7. 验证API结构
    console.log('\n7️⃣ 验证API结构...');
    const requiredApis = [
      'api/health.js',
      'api/admin/login.js',
      'api/admin/stats.js',
      'api/products/index.js'
    ];

    let allApisExist = true;
    for (const api of requiredApis) {
      if (existsSync(api)) {
        console.log(`   ✅ ${api}`);
      } else {
        console.log(`   ❌ ${api} - 缺失`);
        allApisExist = false;
      }
    }

    if (!allApisExist) {
      console.log('   ⚠️  部分API文件缺失，可能影响功能');
    }

    // 8. 创建部署检查清单
    console.log('\n8️⃣ 生成部署清单...');
    const deploymentChecklist = `# Vercel全栈部署清单

## ✅ 准备工作
- [x] 环境依赖检查完成
- [x] 项目依赖安装完成
- [x] 前端构建完成
- [x] API结构验证完成
- [x] 环境变量模板生成完成

## 🔄 下一步操作

### 1. GitHub仓库准备
\`\`\`bash
git add .
git commit -m "重构为Vercel Serverless Functions"
git push origin main
\`\`\`

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
\`\`\`bash
export POSTGRES_URL="vercel-postgres://..."
npm run migrate
\`\`\`

### 6. 部署验证
\`\`\`bash
# 测试API
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/products
\`\`\`

## 🎯 本地开发
\`\`\`bash
# 启动本地开发服务器
vercel dev
\`\`\`

访问 http://localhost:3000 测试应用
`;

    writeFileSync('DEPLOYMENT_CHECKLIST.md', deploymentChecklist);
    console.log('   ✅ 部署清单已生成: DEPLOYMENT_CHECKLIST.md');

    // 9. 完成提示
    console.log('\n🎉 快速启动完成！');
    console.log('\n📋 接下来的步骤：');
    console.log('1. 查看部署清单: cat DEPLOYMENT_CHECKLIST.md');
    console.log('2. 配置环境变量: 编辑 .env.local');
    console.log('3. 提交代码: git add . && git commit -m "Setup for Vercel"');
    console.log('4. 创建Vercel项目: https://vercel.com');
    console.log('5. 本地测试: vercel dev');

    console.log('\n💡 提示：');
    console.log('- 确保在Vercel中创建PostgreSQL数据库');
    console.log('- 配置所有必要的环境变量');
    console.log('- 运行数据迁移（如有现有数据）');

  } catch (error) {
    console.error('\n❌ 快速启动失败:', error.message);
    console.error('请检查错误信息并重试');
  }
}

// 生成随机字符串
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 运行快速启动
quickStart(); 