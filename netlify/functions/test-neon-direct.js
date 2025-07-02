// 直接测试Neon数据库连接
exports.handler = async (event, context) => {
  // 处理CORS预检请求
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

  const testResults = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: []
  };

  try {
    // 步骤1: 检查环境变量
    testResults.steps.push({
      step: 1,
      name: '检查Neon环境变量',
      status: 'running'
    });

    const neonUrl = process.env.NETLIFY_DATABASE_URL;
    const unpooledUrl = process.env.NETLIFY_DATABASE_URL_UNPOOLED;
    
    if (!neonUrl && !unpooledUrl) {
      testResults.steps[0].status = 'failed';
      testResults.steps[0].error = 'Neon环境变量未设置';
      throw new Error('Neon环境变量未设置');
    }

    testResults.steps[0].status = 'success';
    testResults.steps[0].details = {
      pooled_url_available: !!neonUrl,
      unpooled_url_available: !!unpooledUrl,
      using_url: neonUrl ? 'pooled' : 'unpooled'
    };

    // 选择要使用的连接URL
    const selectedUrl = neonUrl || unpooledUrl;

    // 步骤2: 尝试导入pg模块
    testResults.steps.push({
      step: 2,
      name: '导入pg模块',
      status: 'running'
    });

    let Client;
    try {
      const pg = require('pg');
      Client = pg.Client;
      testResults.steps[1].status = 'success';
    } catch (error) {
      testResults.steps[1].status = 'failed';
      testResults.steps[1].error = error.message;
      throw error;
    }

    // 步骤3: 创建连接
    testResults.steps.push({
      step: 3,
      name: '创建Neon数据库连接',
      status: 'running'
    });

    const client = new Client({
      connectionString: selectedUrl
    });

    testResults.steps[2].status = 'success';

    // 步骤4: 连接数据库
    testResults.steps.push({
      step: 4,
      name: '连接到Neon数据库',
      status: 'running'
    });

    await client.connect();
    
    testResults.steps[3].status = 'success';
    testResults.steps[3].details = {
      connection_time: new Date().toISOString()
    };

    // 步骤5: 查询测试
    testResults.steps.push({
      step: 5,
      name: '执行测试查询',
      status: 'running'
    });

    const result = await client.query('SELECT version(), current_database(), current_user');
    
    testResults.steps[4].status = 'success';
    testResults.steps[4].details = {
      postgres_version: result.rows[0]?.version || 'Unknown',
      database_name: result.rows[0]?.current_database || 'Unknown',
      current_user: result.rows[0]?.current_user || 'Unknown'
    };

    // 步骤6: 列出表
    testResults.steps.push({
      step: 6,
      name: '列出现有表',
      status: 'running'
    });

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    testResults.steps[5].status = 'success';
    testResults.steps[5].details = {
      table_count: tablesResult.rows.length,
      tables: tablesResult.rows.map(row => row.table_name)
    };

    // 步骤7: 测试创建表权限
    testResults.steps.push({
      step: 7,
      name: '测试创建表权限',
      status: 'running'
    });

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_connection (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await client.query('INSERT INTO test_connection DEFAULT VALUES');
      const testResult = await client.query('SELECT COUNT(*) as count FROM test_connection');
      
      testResults.steps[6].status = 'success';
      testResults.steps[6].details = {
        can_create_tables: true,
        can_insert_data: true,
        test_record_count: parseInt(testResult.rows[0].count)
      };
      
      // 清理测试表
      await client.query('DROP TABLE test_connection');
      
    } catch (error) {
      testResults.steps[6].status = 'warning';
      testResults.steps[6].error = error.message;
    }

    // 关闭连接
    await client.end();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Neon数据库连接测试成功',
        data: testResults
      })
    };

  } catch (error) {
    console.error('Neon数据库连接测试失败:', error);
    
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 更新当前步骤状态
    const currentStep = testResults.steps.find(s => s.status === 'running');
    if (currentStep) {
      currentStep.status = 'failed';
      currentStep.error = error.message;
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Neon数据库连接测试失败',
        message: error.message,
        data: testResults
      })
    };
  }
}; 