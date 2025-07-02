// Vercel API Route - 产品管理
// 使用修复后的数据库连接

const { connectToDatabase, sql } = require('../lib/database');
const { apiHandler, createApiResponse } = require('../lib/auth');

// 获取商品列表
async function getProducts(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search 
    } = req.query;

    // 连接数据库
    const { Product } = await connectToDatabase();

    // 构建查询条件
    const whereConditions = { status: 'active' };
    
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
    const currentPage = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
    const offset = (currentPage - 1) * pageSize;

    // 获取商品列表和总数
    const { rows: products, count: total } = await Product.findAndCountAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: offset
    });

    return createApiResponse(true, {
      products: products.map(product => ({
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
      })),
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '商品列表获取成功');

  } catch (error) {
    console.error('Get products error:', error);
    return createApiResponse(false, null, '获取商品列表失败', 500);
  }
}

// 创建商品
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

    // 基础验证
    if (!name || !price) {
      return createApiResponse(false, null, '商品名称和价格不能为空', 400);
    }

    // 连接数据库
    const { Product } = await connectToDatabase();

    // 创建商品
    const newProduct = await Product.create({
      name: name.trim(),
      category: category ? category.trim() : null,
      description: description ? description.trim() : null,
      price: parseFloat(price),
      specifications: specifications || null,
      images: images || null,
      stock: stock || 0,
      status: 'active'
    });

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
      return await createProduct(req, res);
    
    default:
      return createApiResponse(false, null, '方法不允许', 405);
  }
}); 