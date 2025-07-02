const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 导入数据库配置和模型
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models/sequelize');

// 导入路由
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products_new'); // 使用新的数据库路由
const orderRoutes = require('./routes/orders_new');     // 使用新的数据库路由
const categoryRoutes = require('./routes/categories');  // 保留原有分类路由
const uploadRoutes = require('./routes/upload');        // 图片上传路由
const userRoutes = require('./routes/users');           // 用户相关路由
const chatRoutes = require('./routes/chat');            // 聊天相关路由
const contractRoutes = require('./routes/contracts');   // 合同相关路由

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

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/health', require('./routes/health'));         // 健康检查路由
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/appointments', require('./routes/appointments')); // 预约管理路由

// 根路径响应
app.get('/', (req, res) => {
  res.json({
    message: '宝得利门窗订购网站 API 服务',
    version: '2.0.0',
    database: 'MySQL + Sequelize',
    status: 'running',
    endpoints: {
      admin: '/api/admin',
      products: '/api/products',
      orders: '/api/orders',
      categories: '/api/categories',
      users: '/api/users',
      chat: '/api/chat',
      contracts: '/api/contracts',
      appointments: '/api/appointments'
    }
  });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// 数据库状态检查
app.get('/api/db-status', async (req, res) => {
  try {
    await require('./config/database').sequelize.authenticate();
    res.json({
      success: true,
      status: 'connected',
      message: '数据库连接正常'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'disconnected',
      message: '数据库连接失败',
      error: error.message
    });
  }
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
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库（不强制重建）
    await syncDatabase(false);
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log('🚀 宝得利门窗API服务器启动成功!');
      console.log(`📍 服务器地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 数据库: MySQL + Sequelize`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
      console.log('📋 可用接口:');
      console.log('   【管理员接口】');
      console.log('   - POST /api/admin/login       - 管理员登录');
      console.log('   - GET  /api/admin/stats       - 获取统计数据');
      console.log('   【商品接口】');
      console.log('   - GET  /api/products          - 获取商品列表');
      console.log('   - GET  /api/products/:id      - 获取商品详情');
      console.log('   - POST /api/products          - 添加商品 [需认证]');
      console.log('   - PUT  /api/products/:id      - 修改商品 [需认证]');
      console.log('   - DELETE /api/products/:id    - 删除商品 [需认证]');
      console.log('   【订单接口】');
      console.log('   - POST /api/orders            - 创建订单');
      console.log('   - GET  /api/orders            - 获取订单列表 [需认证]');
      console.log('   - PUT  /api/orders/:id        - 更新订单状态 [需认证]');
      console.log('   【用户接口】');
      console.log('   - POST /api/users/register    - 用户注册');
      console.log('   - POST /api/users/login       - 用户登录');
      console.log('   - GET  /api/users/profile     - 获取用户信息 [需认证]');
      console.log('   - GET  /api/users/orders      - 获取用户订单历史 [需认证]');
      console.log('   【其他接口】');
      console.log('   - GET  /health                - 健康检查');
      console.log('   - GET  /api/db-status         - 数据库状态');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

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
