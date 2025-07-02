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

    const { Product, Category } = models;

    switch (event.httpMethod) {
      case 'GET':
        // 获取产品列表，包含分类信息
        const products = await Product.findAll({
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          }],
          where: { status: 'active' },
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
            data: products,
            count: products.length
          })
        };

      case 'POST':
        // 创建新产品
        const body = JSON.parse(event.body || '{}');
        const { 
          name, 
          categoryId, 
          price, 
          originalPrice,
          unit,
          description, 
          specifications,
          imageUrl,
          images,
          stock,
          tags
        } = body;

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

        // 验证分类是否存在
        if (categoryId) {
          const categoryExists = await Category.findByPk(categoryId);
          if (!categoryExists) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                success: false,
                error: '指定的分类不存在'
              })
            };
          }
        }

        const newProduct = await Product.create({
          name,
          categoryId: categoryId || null,
          price: parseFloat(price) || 0,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          unit: unit || '扇',
          description,
          specifications: specifications || null,
          imageUrl,
          images: images || null,
          stock: parseInt(stock) || 0,
          tags: tags || null,
          status: 'active'
        });

        // 返回创建的产品，包含分类信息
        const productWithCategory = await Product.findByPk(newProduct.id, {
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          }]
        });

        return {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            data: productWithCategory,
            message: '产品创建成功'
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