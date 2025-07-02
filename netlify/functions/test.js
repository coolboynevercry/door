// Netlify Functions - 测试API
const { testConnection, getDatabaseUrl } = require('./lib/database');

exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    const dbUrl = getDatabaseUrl();

    const response = {
      success: true,
      message: '🎉 Netlify API测试成功！认证保护已解除！',
      timestamp: new Date().toISOString(),
      platform: 'netlify',
      method: event.httpMethod,
      path: event.path,
      database: {
        connected: dbConnected,
        configured: !!dbUrl,
        type: dbUrl ? 'PostgreSQL' : 'None'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        region: process.env.AWS_REGION || 'unknown'
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('测试API错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: '❌ API测试失败',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 