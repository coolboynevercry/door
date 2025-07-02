// 基于test-neon-direct成功模式的用户注册函数
exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  // GET请求：返回连接测试信息
  if (event.httpMethod === 'GET') {
    try {
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
            error: 'Neon环境变量未设置'
          })
        };
      }

      const { Client } = require('pg');
      const client = new Client({ connectionString: neonUrl });
      await client.connect();
      
      const result = await client.query('SELECT NOW() as current_time');
      await client.end();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: '原生pg数据库连接正常',
          data: {
            timestamp: new Date().toISOString(),
            db_time: result.rows[0].current_time,
            ready_for_registration: true
          }
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '数据库连接失败',
          message: error.message
        })
      };
    }
  }

  // POST请求：处理用户注册
  if (event.httpMethod === 'POST') {
    try {
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
            error: 'Neon环境变量未设置'
          })
        };
      }

      const { Client } = require('pg');
      const bcryptjs = require('bcryptjs');
      const jwt = require('jsonwebtoken');

      const client = new Client({ connectionString: neonUrl });
      await client.connect();

      try {
        // 1. 创建用户表（如果不存在）
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

        // 2. 解析请求数据
        const { phone, password, name, wechatId, district, address } = JSON.parse(event.body || '{}');

        // 3. 验证必填字段
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

        // 4. 验证手机号格式
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

        // 5. 检查手机号是否已存在
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

        // 6. 加密密码
        const hashedPassword = await bcryptjs.hash(password, 12);

        // 7. 插入新用户
        const userResult = await client.query(`
          INSERT INTO users (phone, password, name, wechat_id, district, address) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          RETURNING id, phone, name, wechat_id, district, address, role, status, created_at
        `, [phone, hashedPassword, name, wechatId || null, district || null, address || null]);

        const user = userResult.rows[0];

        // 8. 生成JWT token
        const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-secret-2024';
        const token = jwt.sign(
          { 
            userId: user.id,
            phone: user.phone,
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        await client.end();

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: '🎉 注册成功！欢迎加入宝得利门窗！',
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
              token
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
          error: '注册失败，请稍后重试',
          message: error.message
        })
      };
    }
  }

  // 其他请求方法
  return {
    statusCode: 405,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: '不支持的请求方法'
    })
  };
}; 