// Netlify Functions - 管理员登录API
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'netlify-door-window-secret-2024';

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