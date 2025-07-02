const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Product, Order, User } = require('../models/sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 管理员账号密码（支持环境变量配置）
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
    
    // 验证
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // 生成JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
      const token = jwt.sign(
        { 
          username: username,
          role: 'admin',
          id: 1
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.json({
        success: true,
        token: token,
        message: '登录成功',
        user: {
          username: username,
          role: 'admin'
        }
      });
      
    } else {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取统计数据（需要认证）
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 获取商品统计（只统计活跃状态的商品）
    const totalProducts = await Product.count({
      where: { status: 'active' }
    });
    
    // 获取订单统计
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ 
      where: { status: 'pending' } 
    });
    
    // 获取今日新订单数量
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todayOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: tomorrowStart
        }
      }
    });

    // 获取用户统计
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { status: 'active' }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        todayOrders,
        totalUsers,
        activeUsers
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

// 验证token
router.get('/verify', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: '令牌有效'
  });
});

// ===== 用户管理 API =====

// 获取用户列表
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Order,
        as: 'orders',
        attributes: ['id', 'orderNo', 'totalAmount', 'status', 'createdAt']
      }]
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 获取用户详情
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [{
        model: Order,
        as: 'orders',
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
});

// 更新用户状态
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    await user.update({ status });

    res.json({
      success: true,
      message: '用户状态更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
});

// 更新用户信息
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, wechatId, district, address, email } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    await user.update({
      name,
      phone,
      wechatId,
      district,
      address,
      email
    });

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// 删除用户
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户是否有未完成的订单
    const pendingOrders = await Order.count({
      where: {
        userId: id,
        status: ['pending', 'contacted']
      }
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        message: '该用户有未完成的订单，无法删除'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败'
    });
  }
});

module.exports = router;
