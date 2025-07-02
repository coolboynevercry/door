// 原生pg产品管理函数
const { productOperations } = require('./lib/database-native');

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
    switch (event.httpMethod) {
      case 'GET':
        return await handleGetProducts(event);
      case 'POST':
        return await handleCreateProduct(event);
      case 'PUT':
        return await handleUpdateProduct(event);
      case 'DELETE':
        return await handleDeleteProduct(event);
      default:
        return {
          statusCode: 405,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: '不支持的请求方法'
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
        error: '服务器内部错误',
        message: error.message
      })
    };
  }
};

// 获取产品列表
const handleGetProducts = async (event) => {
  const { id } = event.queryStringParameters || {};
  
  try {
    if (id) {
      // 获取单个产品
      const product = await productOperations.findById(id);
      if (!product) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: '产品不存在'
          })
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: product
        })
      };
    } else {
      // 获取产品列表
      const products = await productOperations.findAll();
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: products.map(product => ({
            id: product.id,
            name: product.name,
            categoryId: product.category_id,
            categoryName: product.category_name,
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : null,
            unit: product.unit,
            description: product.description,
            specifications: product.specifications,
            imageUrl: product.image_url,
            images: product.images,
            stock: product.stock,
            soldCount: product.sold_count,
            rating: product.rating ? parseFloat(product.rating) : 5.0,
            tags: product.tags,
            status: product.status,
            createdAt: product.created_at,
            updatedAt: product.updated_at
          }))
        })
      };
    }
  } catch (error) {
    throw error;
  }
};

// 创建产品（管理员功能）
const handleCreateProduct = async (event) => {
  // 这里应该有JWT验证管理员权限，暂时跳过
  
  try {
    const productData = JSON.parse(event.body);
    
    // TODO: 实现产品创建逻辑
    return {
      statusCode: 501,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '产品创建功能待实现'
      })
    };
  } catch (error) {
    throw error;
  }
};

// 更新产品（管理员功能）
const handleUpdateProduct = async (event) => {
  // TODO: 实现产品更新逻辑
  return {
    statusCode: 501,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: '产品更新功能待实现'
    })
  };
};

// 删除产品（管理员功能）
const handleDeleteProduct = async (event) => {
  // TODO: 实现产品删除逻辑
  return {
    statusCode: 501,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: '产品删除功能待实现'
    })
  };
}; 