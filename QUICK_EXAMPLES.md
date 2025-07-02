# 宝得利门窗系统 - 常见更新示例

## 🎨 更新首页内容
1. 编辑: client/src/views/Home.vue
2. 保存并测试: vercel dev
3. 提交: git add . && git commit -m "更新首页产品展示"
4. 部署: git push origin main

## 📱 添加新页面
1. 创建: client/src/views/NewPage.vue  
2. 更新路由: client/src/router/index.js
3. 测试并提交部署

## 🔧 修改API功能
1. 编辑: api/products/index.js
2. 本地测试: curl http://localhost:3000/api/products
3. 提交部署

## 🗄️ 添加新商品
1. 使用管理后台直接添加，或
2. 编辑数据库迁移脚本
3. 在Vercel执行迁移

## 🎛️ 更新配置
1. 修改: vercel.json 或其他配置文件
2. 推送后自动重新部署

## 🔒 更新密码/密钥
1. Vercel Dashboard > Environment Variables
2. 更新相应变量
3. 重新部署项目
