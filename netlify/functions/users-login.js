// Netlify Functions - 用户登录API
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
    const { phone, password } = body;

    // 验证必填字段
    if (!phone || !password) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '手机号和密码不能为空'
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

    // 查找用户
    const user = await models.User.findOne({ where: { phone } });
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '手机号或密码错误'
        })
      };
    }

    // 验证密码
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '手机号或密码错误'
        })
      };
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '账户已被禁用，请联系客服'
        })
      };
    }

    // 更新最后登录时间
    await user.update({ lastLoginAt: new Date() });

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
      lastLoginAt: user.lastLoginAt,
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
          message: '🎉 登录成功！欢迎回到宝得利门窗'
        }
      })
    };

  } catch (error) {
    console.error('用户登录失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '登录失败，请稍后重试'
      })
    };
  }
}; 