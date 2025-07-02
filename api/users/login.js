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
      // 验证码登录
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
} 