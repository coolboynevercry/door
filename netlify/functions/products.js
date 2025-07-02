// Netlify Functions - 产品管理API
const { initModels } = require('./lib/database');

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
    const { db, models } = await initModels();
    
    if (!db) {
      return {
        statusCode: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库连接失败'
        })
      };
    }

    const { Product } = models;

    switch (event.httpMethod) {
      case 'GET':
        // 获取产品列表
        const products = await Product.findAll({
          order: [['createdAt', 'DESC']]
        });

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            data: products
          })
        };

      case 'POST':
        // 创建新产品
        const body = JSON.parse(event.body || '{}');
        const { name, category, price, description, imageUrl } = body;

        if (!name) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              error: '产品名称不能为空'
            })
          };
        }

        const newProduct = await Product.create({
          name,
          category,
          price: parseFloat(price) || 0,
          description,
          imageUrl
        });

        return {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            data: newProduct
          })
        };

      default:
        return {
          statusCode: 405,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: `方法 ${event.httpMethod} 不支持`
          })
        };
    }

  } catch (error) {
    console.error('产品API错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}; 