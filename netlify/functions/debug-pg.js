// 调试原生pg连接问题
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
    const debug = {
      timestamp: new Date().toISOString(),
      step: 1,
      message: '开始调试原生pg连接'
    };

    // 步骤1: 检查环境变量
    debug.step = 1;
    debug.message = '检查环境变量';
    
    const envVars = {
      NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
      NEON_DATABASE_URL: !!process.env.NEON_DATABASE_URL,
      DATABASE_URL: !!process.env.DATABASE_URL
    };

    debug.env_vars = envVars;

    const selectedUrl = process.env.NETLIFY_DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.DATABASE_URL;

    if (!selectedUrl) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '没有找到数据库URL',
          debug
        })
      };
    }

    debug.step = 2;
    debug.message = '尝试导入pg模块';
    debug.url_selected = selectedUrl ? selectedUrl.substring(0, 50) + '...' : 'none';

    // 步骤2: 尝试导入pg
    let Client;
    try {
      const pg = require('pg');
      Client = pg.Client;
      debug.pg_import = 'success';
    } catch (pgError) {
      debug.pg_import = 'failed';
      debug.pg_error = pgError.message;
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'pg模块导入失败',
          debug
        })
      };
    }

    // 步骤3: 尝试创建客户端
    debug.step = 3;
    debug.message = '创建pg客户端';

    let client;
    try {
      client = new Client({ connectionString: selectedUrl });
      debug.client_created = 'success';
    } catch (clientError) {
      debug.client_created = 'failed';
      debug.client_error = clientError.message;
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'pg客户端创建失败',
          debug
        })
      };
    }

    // 步骤4: 尝试连接
    debug.step = 4;
    debug.message = '尝试连接到数据库';

    try {
      await client.connect();
      debug.connection = 'success';

      // 测试简单查询
      const result = await client.query('SELECT NOW() as current_time');
      debug.query_test = 'success';
      debug.query_result = result.rows[0];

      await client.end();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: '原生pg连接完全正常！',
          debug
        })
      };

    } catch (connectionError) {
      debug.connection = 'failed';
      debug.connection_error = connectionError.message;
      debug.connection_stack = connectionError.stack;

      try {
        await client.end();
      } catch (e) {
        // 忽略关闭错误
      }

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库连接失败',
          debug
        })
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '调试过程失败',
        message: error.message,
        stack: error.stack
      })
    };
  }
}; 