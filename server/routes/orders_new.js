const express = require('express');
const jwt = require('jsonwebtoken');
const { Order, User } = require('../models/sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// 生成订单号
const generateOrderNo = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BDL${timestamp}${random}`;
};

// 可选的用户认证中间件
const optionalUserAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.role === 'user') {
        // 获取完整的用户信息
        const user = await User.findByPk(decoded.userId);
        if (user) {
          req.user = {
            userId: user.id,
            phone: user.phone,
            name: user.name,
            role: 'user'
          };
        }
      }
    } catch (error) {
      // 如果token无效，忽略错误，继续执行（因为是可选的）
      console.log('Optional user auth failed:', error.message);
    }
  }
  
  next();
};

// 创建订单（公开接口，支持可选用户认证）
router.post('/', optionalUserAuth, async (req, res) => {
  try {
    const orderData = req.body;
    
    // 验证必填字段
    const requiredFields = ['customerName', 'phone', 'address', 'items'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `缺少必填字段: ${missingFields.join(', ')}`
      });
    }
    
    // 验证商品列表
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '订单商品不能为空'
      });
    }
    
    // 生成订单号
    orderData.orderNo = generateOrderNo();
    
    // 如果用户已登录，关联用户信息
    if (req.user) {
      orderData.userId = req.user.userId;
      
      // 如果订单中的客户信息与登录用户不一致，使用登录用户的信息
      if (!orderData.customerName) {
        orderData.customerName = req.user.name;
      }
      if (!orderData.phone) {
        orderData.phone = req.user.phone;
      }
    }
    
    // 计算总金额（如果没有提供）
    if (!orderData.totalAmount && orderData.items) {
      orderData.totalAmount = orderData.items.reduce((total, item) => {
        return total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
      }, 0);
    }
    
    const order = await Order.create(orderData);
    
    // 如果是注册用户，更新用户统计信息
    if (req.user && req.user.userId) {
      try {
        const user = await User.findByPk(req.user.userId);
        if (user) {
          await user.update({
            totalOrders: user.totalOrders + 1,
            totalAmount: parseFloat(user.totalAmount) + parseFloat(orderData.totalAmount || 0)
          });
        }
      } catch (error) {
        console.error('更新用户统计失败:', error);
        // 不影响订单创建，只记录错误
      }
    }
    
    res.status(201).json({
      success: true,
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败'
    });
  }
});

// 获取所有订单（需要管理员权限）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, date, phone, page = 1, limit = 20 } = req.query;
    const where = {};
    
    // 状态过滤
    if (status) {
      where.status = status;
    }
    
    // 日期过滤
    if (date) {
      where.createdAt = {
        [Op.gte]: new Date(date + ' 00:00:00'),
        [Op.lte]: new Date(date + ' 23:59:59')
      };
    }
    
    // 手机号过滤
    if (phone) {
      where.phone = { [Op.like]: `%${phone}%` };
    }
    
    // 分页配置
    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;
    
    // 配置关联查询，使用正确的别名
    const includeOptions = [{
      model: User,
      as: 'user', // 使用在模型关联中定义的别名
      attributes: ['id', 'name', 'phone', 'wechatId'],
      required: false // 使用LEFT JOIN，允许没有关联用户的订单
    }];
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: includeOptions,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      },
      message: '获取订单列表成功'
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 根据ID获取单个订单（需要管理员权限）
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      data: order,
      message: '获取订单详情成功'
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
});

// 更新订单状态（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 准备更新数据
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    await order.update(updateData);
    
    res.json({
      success: true,
      data: order,
      message: '订单更新成功'
    });
  } catch (error) {
    console.error('更新订单失败:', error);
    res.status(500).json({
      success: false,
      message: '更新订单失败'
    });
  }
});

// 根据订单号查询订单（公开接口）
router.get('/orderNo/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    const order = await Order.findOne({ where: { orderNo } });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      data: order,
      message: '获取订单详情成功'
    });
  } catch (error) {
    console.error('查询订单失败:', error);
    res.status(500).json({
      success: false,
      message: '查询订单失败'
    });
  }
});

// 获取订单统计（需要管理员权限）
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const contactedOrders = await Order.count({ where: { status: 'contacted' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });
    
    // 今日订单
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(todayString)
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        contactedOrders,
        completedOrders,
        todayOrders
      },
      message: '获取统计数据成功'
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

module.exports = router;
