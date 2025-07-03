// Netlify Functions - 管理员登录API + 用户注册API
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'netlify-door-window-secret-2024';

// 用户注册处理函数
async function handleUserRegister(body) {
  console.log('🎯 进入用户注册处理函数，数据:', body);
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

  // 数据库操作
  const neonUrl = process.env.NETLIFY_DATABASE_URL;
  if (!neonUrl) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '数据库配置错误'
      })
    };
  }

  const { Client } = require('pg');
  const client = new Client({ connectionString: neonUrl });
  await client.connect();

  try {
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(11) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        wechat_id VARCHAR(100),
        district VARCHAR(100),
        address TEXT,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 检查用户是否已存在
    const existingUser = await client.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
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

    // 密码加密
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex') + ':' + salt;

    // 插入新用户
    const userResult = await client.query(`
      INSERT INTO users (phone, password, name, wechat_id, district, address) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, phone, name, wechat_id, district, address, role, status, created_at
    `, [phone, hashedPassword, name, wechatId || null, district || null, address || null]);

    const user = userResult.rows[0];

    // 生成token
    const tokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      timestamp: Date.now()
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            wechatId: user.wechat_id,
            district: user.district,
            address: user.address,
            role: user.role,
            status: user.status,
            createdAt: user.created_at
          },
          token,
          message: '🎉 注册成功！欢迎加入宝得利门窗！'
        }
      })
    };

  } finally {
    await client.end();
  }
}

exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        error: '只支持POST请求'
      })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('🔍 接收到的请求数据:', body);
    
    // 检查是否是用户注册请求（包含name字段）
    if (body.name) {
      console.log('✅ 检测到用户注册请求，执行注册逻辑');
      return await handleUserRegister(body);
    }
    
    console.log('👔 执行管理员登录逻辑');
    
    // 管理员登录逻辑
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '用户名和密码不能为空'
        })
      };
    }

    // 简化的管理员验证（生产环境应使用数据库）
    const adminCredentials = {
      admin: '123456', // 默认密码
      manager: 'manager123',
      root: 'root2024'
    };

    if (!adminCredentials[username]) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '用户名或密码错误'
        })
      };
    }

    // 验证密码（这里简化处理，生产环境应使用加密密码）
    if (password !== adminCredentials[username]) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '用户名或密码错误'
        })
      };
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        username, 
        role: 'admin',
        platform: 'netlify' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            username,
            role: 'admin'
          },
          message: '🎉 登录成功！欢迎使用Netlify版门窗管理系统'
        }
      })
    };

  } catch (error) {
    console.error('管理员登录错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}; 