// Netlify Functions - 数据库初始化和种子数据
const { initModels, seedDatabase, testConnection } = require('./lib/database');

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
      platform: 'netlify',
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

    // 2. 初始化数据模型
    results.steps.push({ step: 2, name: '初始化数据模型', status: 'running' });
    const { db, models } = await initModels();
    if (!db) {
      results.steps[1].status = 'failed';
      results.steps[1].error = '数据模型初始化失败';
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据模型初始化失败',
          details: results
        })
      };
    }
    results.steps[1].status = 'success';
    results.steps[1].modelCount = Object.keys(models).length;

    // 3. 同步数据库表结构
    results.steps.push({ step: 3, name: '同步数据库表结构', status: 'running' });
    try {
      await db.sync({ alter: true });
      results.steps[2].status = 'success';
    } catch (error) {
      results.steps[2].status = 'failed';
      results.steps[2].error = error.message;
    }

    // 4. 初始化种子数据
    results.steps.push({ step: 4, name: '初始化种子数据', status: 'running' });
    const seedResult = await seedDatabase();
    if (seedResult) {
      results.steps[3].status = 'success';
    } else {
      results.steps[3].status = 'warning';
      results.steps[3].message = '种子数据已存在或初始化失败';
    }

    // 5. 获取数据统计
    results.steps.push({ step: 5, name: '获取数据统计', status: 'running' });
    try {
      const stats = {
        users: await models.User.count(),
        categories: await models.Category.count(),
        products: await models.Product.count(),
        orders: await models.Order.count(),
        contracts: await models.Contract.count(),
        chatMessages: await models.ChatMessage.count(),
        appointments: await models.Appointment.count()
      };
      results.steps[4].status = 'success';
      results.steps[4].stats = stats;
    } catch (error) {
      results.steps[4].status = 'warning';
      results.steps[4].error = error.message;
    }

    // 检查是否所有关键步骤都成功
    const criticalSteps = results.steps.slice(0, 3); // 前3步是关键步骤
    const allCriticalSuccess = criticalSteps.every(step => step.status === 'success');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: allCriticalSuccess,
        message: allCriticalSuccess 
          ? '🎉 数据库初始化完成！所有表结构和种子数据已就绪' 
          : '⚠️ 数据库初始化部分完成，请检查详细信息',
        data: {
          database: {
            status: allCriticalSuccess ? 'ready' : 'partial',
            platform: 'netlify',
            models: Object.keys(models),
            timestamp: new Date().toISOString()
          },
          results
        }
      })
    };

  } catch (error) {
    console.error('数据库初始化失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '数据库初始化失败',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 