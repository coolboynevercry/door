const { connectToDatabase } = require('../../lib/database');
const { corsHeaders } = require('../../lib/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不允许'
    });
  }

  try {
    const { User } = await connectToDatabase();
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
} 