// 原生pg数据库初始化函数
const { initDatabase, testConnection } = require('./lib/database-native');

exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      platform: 'netlify-native-pg',
      steps: []
    };

    // 1. 测试数据库连接
    results.steps.push({ step: 1, name: '测试数据库连接', status: 'running' });
    const connectionTest = await testConnection();
    if (!connectionTest) {
      results.steps[0].status = 'failed';
      results.steps[0].error = '数据库连接失败';
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库连接失败，请检查环境变量配置',
          details: results
        })
      };
    }
    results.steps[0].status = 'success';

    // 2. 初始化数据库
    results.steps.push({ step: 2, name: '初始化数据库和种子数据', status: 'running' });
    const initResult = await initDatabase();
    if (!initResult) {
      results.steps[1].status = 'failed';
      results.steps[1].error = '数据库初始化失败';
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库初始化失败',
          details: results
        })
      };
    }
    results.steps[1].status = 'success';

    // 3. 验证数据
    results.steps.push({ step: 3, name: '验证数据完整性', status: 'running' });
    const { query } = require('./lib/database-native');
    
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const categoryCount = await query('SELECT COUNT(*) as count FROM categories');
    const productCount = await query('SELECT COUNT(*) as count FROM products');
    
    results.steps[2].status = 'success';
    results.steps[2].details = {
      users: parseInt(userCount.rows[0].count),
      categories: parseInt(categoryCount.rows[0].count),
      products: parseInt(productCount.rows[0].count)
    };

    const allSuccess = results.steps.every(step => step.status === 'success');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: allSuccess,
        message: allSuccess 
          ? '🎉 原生pg数据库初始化完成！所有表结构和种子数据已就绪' 
          : '⚠️ 数据库初始化部分完成，请检查详细信息',
        data: {
          database: {
            status: allSuccess ? 'ready' : 'partial',
            platform: 'netlify-native-pg',
            engine: 'PostgreSQL with native pg client',
            tables: ['users', 'categories', 'products', 'orders', 'contracts', 'chat_messages', 'appointments'],
            timestamp: new Date().toISOString()
          },
          results
        }
      })
    };

  } catch (error) {
    console.error('原生pg数据库初始化失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '原生pg数据库初始化失败',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 