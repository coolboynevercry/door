const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 导入路由
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet()); // 安全头设置
app.use(morgan('combined')); // 请求日志

// CORS配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser配置
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（如果需要）
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// 根路径响应
app.get('/', (req, res) => {
  res.json({
    message: '宝得利门窗订购网站 API 服务',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      categories: '/api/categories',
      admin: '/api/admin'
    }
  });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404错误处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    requestedUrl: req.originalUrl
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 宝得利门窗API服务器启动成功!');
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('📋 可用接口:');
  console.log('   - GET  /api/products     - 获取产品列表');
  console.log('   - GET  /api/products/:id - 获取产品详情');
  console.log('   - POST /api/orders       - 创建订单');
  console.log('   - GET  /api/orders       - 获取订单列表');
  console.log('   - GET  /api/categories   - 获取产品分类');
  console.log('   - POST /api/admin/login  - 管理员登录');
  console.log('   - GET  /api/admin/stats  - 获取统计数据');
  console.log('   - GET  /health           - 健康检查');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('📴 收到SIGTERM信号，正在优雅关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 收到SIGINT信号，正在优雅关闭服务器...');
  process.exit(0);
});

module.exports = app; 