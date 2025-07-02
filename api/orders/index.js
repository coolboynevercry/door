const { connectToDatabase } = require('../../lib/database');
const { corsHeaders, authenticateToken } = require('../../lib/auth');
const { Op } = require('sequelize');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { Order, User } = await connectToDatabase();

    if (req.method === 'POST') {
      // 创建新订单
      const {
        userId,
        products,
        totalAmount,
        installAddress,
        customerName,
        customerPhone,
        appointmentDate,
        notes,
        status = 'pending'
      } = req.body;

      // 验证必要字段
      if (!products || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: '订单商品不能为空'
        });
      }

      if (!customerName || !customerPhone) {
        return res.status(400).json({
          success: false,
          message: '客户姓名和手机号不能为空'
        });
      }

      // 生成订单号
      const orderNo = 'BDL' + Date.now() + Math.floor(Math.random() * 1000);

      const order = await Order.create({
        orderNo,
        userId,
        products: JSON.stringify(products),
        totalAmount,
        installAddress,
        customerName,
        customerPhone,
        appointmentDate,
        notes,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json({
        success: true,
        data: order,
        message: '订单创建成功'
      });

    } else if (req.method === 'GET') {
      // 获取订单列表
      const { 
        page = 1, 
        limit = 10, 
        status = '', 
        phone = '', 
        startDate = '', 
        endDate = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;

      // 构建查询条件
      const whereClause = {};
      if (status) whereClause.status = status;
      if (phone) whereClause.customerPhone = { [Op.like]: `%${phone}%` };
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
      }

      const { count, rows } = await Order.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'phone']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          orders: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        },
        message: '获取订单列表成功'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: '方法不允许'
      });
    }
  } catch (error) {
    console.error('订单操作失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
} 