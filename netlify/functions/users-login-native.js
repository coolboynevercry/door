// 原生pg用户登录函数
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userOperations } = require('./lib/database-native');

const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-secret-2024';

exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
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
        error: '仅支持POST请求'
      })
    };
  }

  try {
    const { phone, password } = JSON.parse(event.body);

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
          error: '手机号和密码为必填项'
        })
      };
    }

    // 查找用户
    const user = await userOperations.findByPhone(phone);
    if (!user) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '用户不存在或密码错误'
        })
      };
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '用户不存在或密码错误'
        })
      };
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '账户已被禁用，请联系管理员'
        })
      };
    }

    // 更新最后登录时间
    await userOperations.updateLoginTime(user.id);

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phone: user.phone,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            wechatId: user.wechat_id,
            district: user.district,
            address: user.address,
            role: user.role,
            status: user.status,
            lastLoginAt: new Date().toISOString()
          }
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
        error: '登录失败',
        message: error.message
      })
    };
  }
}; 