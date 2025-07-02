const { apiHandler, adminApiHandler, createApiResponse } = require('../../lib/auth');
const { connectToDatabase, sql } = require('../../lib/database');
const { calculatePagination, validators, sanitizers } = require('../../lib/utils');

// 获取商品列表 (公开接口)
async function getProducts(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      status = 'active' 
    } = req.query;

    // 连接数据库
    const { Product } = await connectToDatabase();

    // 构建查询条件
    const whereConditions = { status };
    
    if (category) {
      whereConditions.category = category;
    }

    if (search) {
      const { Op } = require('sequelize');
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // 计算分页
    const pagination = calculatePagination(page, limit);

    // 获取商品列表和总数
    const { rows: products, count: total } = await Product.findAndCountAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset
    });

    // 格式化数据
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: parseFloat(product.price),
      specifications: product.specifications,
      images: product.images,
      stock: product.stock,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return createApiResponse(true, {
      products: formattedProducts,
      pagination: {
        ...pagination,
        total
      }
    }, '商品列表获取成功');

  } catch (error) {
    console.error('Get products error:', error);
    return createApiResponse(false, null, '获取商品列表失败', 500);
  }
}

// 创建商品 (需要管理员权限)
async function createProduct(req, res) {
  try {
    const {
      name,
      category,
      description,
      price,
      specifications,
      images = [],
      stock = 0
    } = req.body;

    // 数据验证
    if (!validators.required(name)) {
      return createApiResponse(false, null, '商品名称不能为空', 400);
    }

    if (!validators.price(price)) {
      return createApiResponse(false, null, '请输入有效的价格', 400);
    }

    // 连接数据库
    const { Product } = await connectToDatabase();

    // 数据清理
    const cleanData = {
      name: sanitizers.trim(name),
      category: category ? sanitizers.trim(category) : null,
      description: description ? sanitizers.trim(description) : null,
      price: sanitizers.number(price),
      specifications: specifications || null,
      images: images || null,
      stock: stock || 0
    };

    // 创建商品
    const newProduct = await Product.create(cleanData);

    return createApiResponse(true, {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      createdAt: newProduct.createdAt
    }, '商品创建成功', 201);

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return createApiResponse(false, null, '商品名称已存在', 400);
    }
    
    return createApiResponse(false, null, '创建商品失败', 500);
  }
}

// 主处理函数
module.exports = apiHandler(async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await getProducts(req, res);
    
    case 'POST':
      // 创建商品需要管理员权限
      const adminHandler = adminApiHandler(createProduct);
      return await adminHandler(req, res);
    
    default:
      return createApiResponse(false, null, '方法不允许', 405);
  }
}); 