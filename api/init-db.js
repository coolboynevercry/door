const { initializeDatabase } = require('../scripts/init-vercel-db');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不允许，请使用POST请求'
    });
  }

  try {
    // 检查是否提供初始化密钥（可选的安全措施）
    const { initKey } = req.body;
    const expectedKey = process.env.DB_INIT_KEY || 'baodeli-init-2024';
    
    if (initKey !== expectedKey) {
      return res.status(401).json({
        success: false,
        message: '初始化密钥错误'
      });
    }

    console.log('🚀 开始数据库初始化...');
    await initializeDatabase();

    res.json({
      success: true,
      message: '数据库初始化成功！',
      data: {
        tables: [
          'users (用户表)',
          'products (产品表)',
          'orders (订单表)',
          'chat_messages (聊天消息表)',
          'contracts (合同表)'
        ],
        defaultAdmin: {
          username: 'admin',
          password: '123456',
          note: '请在生产环境中修改默认密码'
        }
      }
    });

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库初始化失败: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 