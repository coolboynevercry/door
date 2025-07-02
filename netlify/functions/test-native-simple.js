// 简单的原生pg测试函数
exports.handler = async (event, context) => {
  // 处理CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // 测试直接pg连接
    const { Client } = require('pg');
    
    const databaseUrl = process.env.NETLIFY_DATABASE_URL;
    if (!databaseUrl) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库URL未配置'
        })
      };
    }

    const client = new Client({
      connectionString: databaseUrl
    });

    await client.connect();
    
    // 测试创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(11) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 插入测试数据
    await client.query(`
      INSERT INTO test_users (phone, name) 
      VALUES ($1, $2) 
      ON CONFLICT (phone) DO NOTHING
    `, ['13999999999', '测试用户']);

    // 查询数据
    const result = await client.query('SELECT * FROM test_users LIMIT 5');
    
    await client.end();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: '原生pg基础功能测试成功',
        data: {
          timestamp: new Date().toISOString(),
          database_url_configured: true,
          table_created: true,
          test_data: result.rows,
          row_count: result.rows.length
        }
      })
    };

  } catch (error) {
    console.error('原生pg测试失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '原生pg测试失败',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 