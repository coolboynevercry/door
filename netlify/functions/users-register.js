// Netlify Functions - 用户注册API（无需验证码）
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initModels } = require('./lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '方法不被允许'
      })
    };
  }

  try {
    const { db, models } = await initModels();
    if (!db || !models.User) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库连接失败'
        })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { phone, password, name, wechatId, district, address } = body;

    // 验证必填字段
    if (!phone || !password || !name) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '手机号、密码和姓名为必填项'
        })
      };
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '请输入正确的11位手机号'
        })
      };
    }

    // 验证密码长度
    if (password.length < 6) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '密码长度至少6位'
        })
      };
    }

    // 检查手机号是否已存在
    const existingUser = await models.User.findOne({ where: { phone } });
    if (existingUser) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '该手机号已被注册'
        })
      };
    }

    // 加密密码
    const hashedPassword = await bcryptjs.hash(password, 12);

    // 创建用户
    const user = await models.User.create({
      phone,
      password: hashedPassword,
      name,
      wechatId: wechatId || null,
      district: district || null,
      address: address || null,
      role: 'user',
      status: 'active'
    });

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phone: user.phone,
        role: user.role,
        platform: 'netlify'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 返回用户信息（不包含密码）
    const userInfo = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      wechatId: user.wechatId,
      district: user.district,
      address: user.address,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: {
          user: userInfo,
          token,
          message: '🎉 注册成功！欢迎加入宝得利门窗！'
        }
      })
    };

  } catch (error) {
    console.error('用户注册失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '注册失败，请稍后重试'
      })
    };
  }
}; 