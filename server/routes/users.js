const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Order } = require('../models/sequelize');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name, wechatId, district, address, verificationCode, isAdmin = false } = req.body;

    // 验证必填字段
    if (!phone || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '手机号、密码和姓名是必填项'
      });
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少6位'
      });
    }

    // 验证码验证（开发环境使用固定验证码）
    if (process.env.NODE_ENV !== 'development' && verificationCode !== '123456') {
      return res.status(400).json({
        success: false,
        message: '验证码错误'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该手机号已注册'
      });
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建新用户
    const user = await User.create({
      phone,
      password: hashedPassword,
      name,
      wechatId,
      district,
      address,
      isAdmin,
      lastLoginAt: new Date()
    });

    // 生成JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
    const token = jwt.sign(
      { 
        userId: user.id,
        phone: user.phone,
        role: user.isAdmin ? 'admin' : 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          wechatId: user.wechatId,
          district: user.district,
          address: user.address
        }
      }
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// 用户登录  
router.post('/login', async (req, res) => {
  try {
    const { phone, password, name, verificationCode, loginType = 'password' } = req.body;

    // 验证必填字段
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: '手机号是必填项'
      });
    }

    if (loginType === 'password') {
      // 密码登录
      if (!password) {
        return res.status(400).json({
          success: false,
          message: '密码是必填项'
        });
      }

      // 查找用户
      const user = await User.findOne({ where: { phone } });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: '用户不存在，请先注册'
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '密码错误'
        });
      }

      // 更新最后登录时间
      await user.update({ lastLoginAt: new Date() });

      // 生成JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
      const token = jwt.sign(
        { 
          userId: user.id,
          phone: user.phone,
          role: user.isAdmin ? 'admin' : 'user'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            wechatId: user.wechatId,
            district: user.district,
            address: user.address
          }
        }
      });
    } else {
      // 验证码登录（保持原有逻辑）
      if (!name) {
        return res.status(400).json({
          success: false,
          message: '姓名是必填项'
        });
      }

      // 验证码验证（开发环境使用固定验证码）
      if (process.env.NODE_ENV !== 'development' && verificationCode !== '123456') {
        return res.status(400).json({
          success: false,
          message: '验证码错误'
        });
      }

      // 查找或创建用户
      let user = await User.findOne({ where: { phone } });
      
      if (!user) {
        // 用户不存在，创建新用户
        user = await User.create({
          phone,
          name,
          lastLoginAt: new Date()
        });
      } else {
        // 用户存在，更新最后登录时间和姓名
        await user.update({
          name,
          lastLoginAt: new Date()
        });
      }

      // 生成JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
      const token = jwt.sign(
        { 
          userId: user.id,
          phone: user.phone,
          role: 'user'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            wechatId: user.wechatId,
            district: user.district,
            address: user.address
          }
        }
      });
    }
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 验证用户token中间件
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供访问令牌'
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '令牌无效'
      });
    }
    
    if (user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    
    req.user = user;
    next();
  });
};

// 获取用户信息
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        wechatId: user.wechatId,
        district: user.district,
        address: user.address,
        email: user.email,
        totalOrders: user.totalOrders,
        totalAmount: user.totalAmount,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, wechatId, district, address, email } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    await user.update({
      name,
      wechatId,
      district,
      address,
      email
    });

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        wechatId: user.wechatId,
        district: user.district,
        address: user.address,
        email: user.email
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// 获取用户历史订单
router.get('/orders', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const whereClause = { userId: req.user.userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
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
      }
    });
  } catch (error) {
    console.error('获取用户订单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单历史失败'
    });
  }
});

// 获取订单详情
router.get('/orders/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
});

// 发送验证码 (模拟)
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 模拟发送验证码
    // 在实际项目中，这里应该调用短信服务API
    console.log(`发送验证码到 ${phone}: 123456`);

    res.json({
      success: true,
      message: '验证码发送成功'
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败'
    });
  }
});

module.exports = router; 