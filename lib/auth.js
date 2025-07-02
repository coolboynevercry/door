import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 生成JWT Token
export function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// 验证JWT Token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 从请求头获取token
export function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// 验证管理员身份
export function verifyAdmin(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { success: false, message: '未提供认证令牌' };
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'admin') {
    return { success: false, message: '无效的管理员令牌' };
  }

  return { success: true, user: decoded };
}

// 验证用户身份
export function verifyUser(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { success: false, message: '未提供认证令牌' };
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'user') {
    return { success: false, message: '无效的用户令牌' };
  }

  return { success: true, user: decoded };
}

// 管理员登录验证
export function verifyAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 密码加密
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// 密码验证
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 生成随机验证码
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// CORS处理
export function handleCors(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// API响应包装器
export function createApiResponse(success, data = null, message = '', statusCode = 200) {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };
}

// 错误处理包装器
export function handleApiError(error, defaultMessage = '服务器内部错误') {
  console.error('API Error:', error);
  
  return createApiResponse(
    false,
    null,
    error.message || defaultMessage,
    error.status || 500
  );
}

// API路由包装器，处理通用逻辑
export function apiHandler(handler) {
  return async (req, res) => {
    try {
      // 处理CORS
      if (handleCors(req, res)) {
        return;
      }

      // 调用实际处理函数
      const result = await handler(req, res);
      
      // 如果处理函数返回数据，自动发送响应
      if (result && !res.headersSent) {
        res.status(result.statusCode || 200).json(result);
      }
    } catch (error) {
      console.error('API Handler Error:', error);
      
      if (!res.headersSent) {
        const errorResponse = handleApiError(error);
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    }
  };
}

// 需要管理员权限的API包装器
export function adminApiHandler(handler) {
  return apiHandler(async (req, res) => {
    const authResult = verifyAdmin(req);
    if (!authResult.success) {
      return createApiResponse(false, null, authResult.message, 401);
    }

    // 将用户信息附加到请求对象
    req.admin = authResult.user;
    return await handler(req, res);
  });
}

// 需要用户权限的API包装器
export function userApiHandler(handler) {
  return apiHandler(async (req, res) => {
    const authResult = verifyUser(req);
    if (!authResult.success) {
      return createApiResponse(false, null, authResult.message, 401);
    }

    // 将用户信息附加到请求对象
    req.user = authResult.user;
    return await handler(req, res);
  });
} 