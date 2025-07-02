// Netlify Functions - 用户注册API（使用原生pg，无需验证码）
const { Client } = require('pg');

// 原生pg数据库连接 - 使用和test-neon-direct相同的成功模式
const createConnection = async () => {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('Neon环境变量未设置');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  return client;
};

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
    let client;
    try {
      client = await createConnection();
    } catch (dbError) {
      console.error('数据库连接失败:', dbError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库连接失败',
          details: dbError.message
        })
      };
    }

    try {
      // 创建用户表（如果不存在）
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
          last_login_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

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

      // 简单密码加密（使用Node.js内置crypto）
      const crypto = require('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex') + ':' + salt;

      // 创建用户（使用原生pg）
      const userResult = await client.query(`
        INSERT INTO users (phone, password, name, wechat_id, district, address, role, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id, phone, name, wechat_id, district, address, role, status, created_at
      `, [phone, hashedPassword, name, wechatId || null, district || null, address || null, 'user', 'active']);

      const user = userResult.rows[0];

      // 生成简单token（使用base64编码）
      const tokenPayload = {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        timestamp: Date.now()
      };
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      // 返回用户信息（不包含密码）
      const userInfo = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        wechatId: user.wechat_id,
        district: user.district,
        address: user.address,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
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

    } finally {
      await client.end();
    }

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