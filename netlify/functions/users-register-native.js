// 原生pg用户注册函数 - 无验证码版本
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
    const { phone, password, name, wechatId, district, address } = JSON.parse(event.body);

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
          error: '手机号格式不正确'
        })
      };
    }

    // 检查用户是否已存在
    const existingUser = await userOperations.findByPhone(phone);
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = await userOperations.create({
      phone,
      password: hashedPassword,
      name,
      wechatId: wechatId || null,
      district: district || null,
      address: address || null
    });

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        phone: newUser.phone,
        role: newUser.role 
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
        message: '用户注册成功',
        data: {
          token,
          user: {
            id: newUser.id,
            phone: newUser.phone,
            name: newUser.name,
            wechatId: newUser.wechat_id,
            district: newUser.district,
            address: newUser.address,
            role: newUser.role,
            status: newUser.status,
            createdAt: newUser.created_at
          }
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
        error: '用户注册失败',
        message: error.message
      })
    };
  }
}; 