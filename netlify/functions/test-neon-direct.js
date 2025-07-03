// 直接测试Neon数据库连接 + 用户注册功能
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
      const client = new Client({ connectionString: neonUrl });
      await client.connect();

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

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

        // 简单密码加密（不依赖bcryptjs）
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

        // 生成简单token（不依赖jsonwebtoken）
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

  // GET请求：继续原有的数据库测试逻辑
  const testResults = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: []
  };

  try {
    // 步骤1: 检查环境变量
    testResults.steps.push({
      step: 1,
      name: '检查Neon环境变量',
      status: 'running'
    });

    const neonUrl = process.env.NETLIFY_DATABASE_URL;
    const unpooledUrl = process.env.NETLIFY_DATABASE_URL_UNPOOLED;
    
    if (!neonUrl && !unpooledUrl) {
      testResults.steps[0].status = 'failed';
      testResults.steps[0].error = 'Neon环境变量未设置';
      throw new Error('Neon环境变量未设置');
    }

    testResults.steps[0].status = 'success';
    testResults.steps[0].details = {
      pooled_url_available: !!neonUrl,
      unpooled_url_available: !!unpooledUrl,
      using_url: neonUrl ? 'pooled' : 'unpooled'
    };

    // 选择要使用的连接URL
    const selectedUrl = neonUrl || unpooledUrl;

    // 步骤2: 尝试导入pg模块
    testResults.steps.push({
      step: 2,
      name: '导入pg模块',
      status: 'running'
    });

    let Client;
    try {
      const pg = require('pg');
      Client = pg.Client;
      testResults.steps[1].status = 'success';
    } catch (error) {
      testResults.steps[1].status = 'failed';
      testResults.steps[1].error = error.message;
      throw error;
    }

    // 步骤3: 创建连接
    testResults.steps.push({
      step: 3,
      name: '创建Neon数据库连接',
      status: 'running'
    });

    const client = new Client({
      connectionString: selectedUrl
    });

    testResults.steps[2].status = 'success';

    // 步骤4: 连接数据库
    testResults.steps.push({
      step: 4,
      name: '连接到Neon数据库',
      status: 'running'
    });

    await client.connect();
    
    testResults.steps[3].status = 'success';
    testResults.steps[3].details = {
      connection_time: new Date().toISOString()
    };

    // 步骤5: 查询测试
    testResults.steps.push({
      step: 5,
      name: '执行测试查询',
      status: 'running'
    });

    const result = await client.query('SELECT version(), current_database(), current_user');
    
    testResults.steps[4].status = 'success';
    testResults.steps[4].details = {
      postgres_version: result.rows[0]?.version || 'Unknown',
      database_name: result.rows[0]?.current_database || 'Unknown',
      current_user: result.rows[0]?.current_user || 'Unknown'
    };

    // 步骤6: 列出表
    testResults.steps.push({
      step: 6,
      name: '列出现有表',
      status: 'running'
    });

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    testResults.steps[5].status = 'success';
    testResults.steps[5].details = {
      table_count: tablesResult.rows.length,
      tables: tablesResult.rows.map(row => row.table_name)
    };

    // 步骤7: 测试创建表权限
    testResults.steps.push({
      step: 7,
      name: '测试创建表权限',
      status: 'running'
    });

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_connection (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await client.query('INSERT INTO test_connection DEFAULT VALUES');
      const testResult = await client.query('SELECT COUNT(*) as count FROM test_connection');
      
      testResults.steps[6].status = 'success';
      testResults.steps[6].details = {
        can_create_tables: true,
        can_insert_data: true,
        test_record_count: parseInt(testResult.rows[0].count)
      };
      
      // 清理测试表
      await client.query('DROP TABLE test_connection');
      
    } catch (error) {
      testResults.steps[6].status = 'warning';
      testResults.steps[6].error = error.message;
    }

    // 关闭连接
    await client.end();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Neon数据库连接测试成功',
        data: testResults
      })
    };

  } catch (error) {
    console.error('Neon数据库连接测试失败:', error);
    
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 更新当前步骤状态
    const currentStep = testResults.steps.find(s => s.status === 'running');
    if (currentStep) {
      currentStep.status = 'failed';
      currentStep.error = error.message;
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Neon数据库连接测试失败',
        message: error.message,
        data: testResults
      })
    };
  }
}; 