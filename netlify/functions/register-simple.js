// 最简单的用户注册函数 - 基于test-neon-direct成功连接
exports.handler = async (event, context) => {
  // 处理CORS
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

  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, error: '仅支持POST请求' })
    };
  }

  try {
    // 使用和test-neon-direct完全相同的连接方式
    const neonUrl = process.env.NETLIFY_DATABASE_URL;
    if (!neonUrl) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, error: 'Neon环境变量未设置' })
      };
    }

    const { Client } = require('pg');
    const client = new Client({ connectionString: neonUrl });
    await client.connect();

    try {
      // 解析请求数据
      const { phone, password, name, wechatId, district, address } = JSON.parse(event.body || '{}');

      // 验证必填字段
      if (!phone || !password || !name) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ success: false, error: '手机号、密码和姓名为必填项' })
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
          body: JSON.stringify({ success: false, error: '请输入正确的11位手机号' })
        };
      }

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
          body: JSON.stringify({ success: false, error: '该手机号已被注册' })
        };
      }

      // 简单密码加密
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

      // 生成简单token
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

  } catch (error) {
    console.error('注册失败:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '注册失败，请稍后重试',
        message: error.message
      })
    };
  }
}; 