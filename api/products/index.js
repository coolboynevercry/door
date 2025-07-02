import { apiHandler, adminApiHandler, createApiResponse } from '../../lib/auth.js';
import { sql } from '../../lib/database.js';
import { calculatePagination, validators, sanitizers } from '../../lib/utils.js';

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

    // 构建查询条件
    let whereConditions = ['status = $1'];
    let queryParams = [status];
    let paramIndex = 2;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
    const countResult = await sql.unsafe(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // 计算分页
    const pagination = calculatePagination(page, limit, total);

    // 获取商品列表
    const productsQuery = `
      SELECT 
        id, name, category, subcategory, specification, description,
        price, price_unit, image, material, specifications,
        colors, features, variants, status, created_at, updated_at
      FROM products 
      WHERE ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const productsResult = await sql.unsafe(productsQuery, [
      ...queryParams,
      pagination.limit,
      pagination.offset
    ]);

    const products = productsResult.rows.map(product => ({
      ...product,
      price: parseFloat(product.price),
      colors: product.colors ? JSON.parse(product.colors) : [],
      features: product.features ? JSON.parse(product.features) : [],
      variants: product.variants ? JSON.parse(product.variants) : []
    }));

    return createApiResponse(true, {
      products,
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
      subcategory,
      specification,
      description,
      price,
      priceUnit = '个',
      image,
      material,
      specifications,
      colors = [],
      features = [],
      variants = []
    } = req.body;

    // 数据验证
    if (!validators.required(name)) {
      return createApiResponse(false, null, '商品名称不能为空', 400);
    }

    if (!validators.required(category)) {
      return createApiResponse(false, null, '商品分类不能为空', 400);
    }

    if (!validators.price(price)) {
      return createApiResponse(false, null, '请输入有效的价格', 400);
    }

    // 数据清理
    const cleanData = {
      name: sanitizers.trim(name),
      category: sanitizers.trim(category),
      subcategory: subcategory ? sanitizers.trim(subcategory) : null,
      specification: specification ? sanitizers.trim(specification) : null,
      description: description ? sanitizers.trim(description) : null,
      price: sanitizers.number(price),
      priceUnit: sanitizers.trim(priceUnit),
      image: image ? sanitizers.trim(image) : null,
      material: material ? sanitizers.trim(material) : null,
      specifications: specifications ? sanitizers.trim(specifications) : null,
      colors: JSON.stringify(colors),
      features: JSON.stringify(features),
      variants: JSON.stringify(variants)
    };

    // 插入数据库
    const result = await sql`
      INSERT INTO products (
        name, category, subcategory, specification, description,
        price, price_unit, image, material, specifications,
        colors, features, variants, status, created_at, updated_at
      ) VALUES (
        ${cleanData.name}, ${cleanData.category}, ${cleanData.subcategory},
        ${cleanData.specification}, ${cleanData.description}, ${cleanData.price},
        ${cleanData.priceUnit}, ${cleanData.image}, ${cleanData.material},
        ${cleanData.specifications}, ${cleanData.colors}, ${cleanData.features},
        ${cleanData.variants}, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id, name, category, price, created_at
    `;

    const newProduct = result.rows[0];

    return createApiResponse(true, {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      createdAt: newProduct.created_at
    }, '商品创建成功', 201);

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === '23505') { // 唯一约束违反
      return createApiResponse(false, null, '商品名称已存在', 400);
    }
    
    return createApiResponse(false, null, '创建商品失败', 500);
  }
}

// 主处理函数
export default apiHandler(async (req, res) => {
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