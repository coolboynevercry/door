// 测试Sequelize连接
const { Sequelize } = require('sequelize');

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
      name: '检查环境变量',
      status: 'running'
    });

    const databaseUrl = process.env.NETLIFY_DATABASE_URL;
    if (!databaseUrl) {
      testResults.steps[0].status = 'failed';
      testResults.steps[0].error = 'NETLIFY_DATABASE_URL未设置';
      throw new Error('环境变量未设置');
    }

    const isNeonDb = databaseUrl.includes('neon.tech');
    
    testResults.steps[0].status = 'success';
    testResults.steps[0].details = {
      url_length: databaseUrl.length,
      is_neon_db: isNeonDb,
      url_preview: databaseUrl.substring(0, 50) + '...'
    };

    // 步骤2: 配置Sequelize选项
    testResults.steps.push({
      step: 2,
      name: '配置Sequelize选项',
      status: 'running'
    });

    const config = {
      dialect: 'postgres',
      logging: console.log, // 启用详细日志
      pool: {
        max: 2,
        min: 0,
        acquire: 10000,
        idle: 5000
      }
    };

    // 尝试不同的SSL配置
    if (isNeonDb) {
      // 不添加任何SSL配置，让连接字符串处理
    } else {
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    }

    testResults.steps[1].status = 'success';
    testResults.steps[1].details = {
      config: {
        dialect: config.dialect,
        has_ssl_config: !!config.dialectOptions,
        pool_config: config.pool
      }
    };

    // 步骤3: 创建Sequelize实例
    testResults.steps.push({
      step: 3,
      name: '创建Sequelize实例',
      status: 'running'
    });

    const sequelize = new Sequelize(databaseUrl, config);

    testResults.steps[2].status = 'success';
    testResults.steps[2].details = {
      dialect: sequelize.getDialect(),
      database_name: sequelize.getDatabaseName()
    };

    // 步骤4: 测试认证
    testResults.steps.push({
      step: 4,
      name: '测试Sequelize认证',
      status: 'running'
    });

    await sequelize.authenticate();
    
    testResults.steps[3].status = 'success';
    testResults.steps[3].details = {
      connection_time: new Date().toISOString()
    };

    // 步骤5: 执行简单查询
    testResults.steps.push({
      step: 5,
      name: '执行查询测试',
      status: 'running'
    });

    const [results] = await sequelize.query('SELECT version() as version, current_database() as db');
    
    testResults.steps[4].status = 'success';
    testResults.steps[4].details = {
      query_result: results[0]
    };

    // 步骤6: 测试模型定义
    testResults.steps.push({
      step: 6,
      name: '测试模型定义',
      status: 'running'
    });

    const TestModel = sequelize.define('TestConnection', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
      tableName: 'test_connections',
      timestamps: true
    });

    testResults.steps[5].status = 'success';
    testResults.steps[5].details = {
      model_name: TestModel.name,
      table_name: TestModel.tableName
    };

    // 关闭连接
    await sequelize.close();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Sequelize连接测试成功',
        data: testResults
      })
    };

  } catch (error) {
    console.error('Sequelize连接测试失败:', error);
    
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });

    // 更新当前步骤状态
    const currentStep = testResults.steps.find(s => s.status === 'running');
    if (currentStep) {
      currentStep.status = 'failed';
      currentStep.error = error.message;
      currentStep.error_details = {
        name: error.name,
        code: error.code,
        errno: error.errno
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Sequelize连接测试失败',
        message: error.message,
        data: testResults
      })
    };
  }
}; 