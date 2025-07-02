// Vercel API Route - 产品管理
// 替换 server/routes/products_new.js

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // 获取产品列表
      const { page = 1, limit = 20, category, search } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = "WHERE status = 'active'";
      const params = [];
      
      if (category) {
        whereClause += " AND category = $" + (params.length + 1);
        params.push(category);
      }
      
      if (search) {
        whereClause += " AND name ILIKE $" + (params.length + 1);
        params.push(`%${search}%`);
      }
      
      const countResult = await sql`
        SELECT COUNT(*) as count 
        FROM products 
        ${sql.unsafe(whereClause)}
      `;
      
      const products = await sql`
        SELECT * FROM products 
        ${sql.unsafe(whereClause)}
        ORDER BY createdAt DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      res.status(200).json({
        success: true,
        data: {
          products: products.rows,
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          totalPages: Math.ceil(countResult.rows[0].count / limit)
        }
      });
      
    } else if (req.method === 'POST') {
      // 认证检查
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: '未提供认证令牌' });
      }
      
      // 创建产品
      const {
        name,
        category,
        subcategory,
        specification,
        price,
        priceUnit,
        description,
        features,
        colors,
        image
      } = req.body;
      
      const result = await sql`
        INSERT INTO products (
          name, category, subcategory, specification, price, priceUnit,
          description, features, colors, image, status, createdAt, updatedAt
        ) VALUES (
          ${name}, ${category}, ${subcategory}, ${specification}, ${price}, ${priceUnit},
          ${description}, ${JSON.stringify(features)}, ${JSON.stringify(colors)}, 
          ${image}, 'active', NOW(), NOW()
        ) RETURNING *
      `;
      
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: '商品添加成功'
      });
      
    } else {
      res.status(405).json({ success: false, message: '方法不允许' });
    }
    
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 