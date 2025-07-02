const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问被拒绝，需要有效的认证令牌'
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '令牌无效或已过期'
      });
    }

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  });
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // 没有token，继续但不设置user
    req.user = null;
    return next();
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'baodeli-door-window-secret-key-2024';
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // token无效，继续但不设置user
      req.user = null;
    } else {
      // token有效，设置用户信息
      req.user = decoded;
    }
    next();
  });
};

// 管理员权限中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// 验证管理员权限（用于导出）
const verifyAdmin = [authenticateToken, requireAdmin];

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  verifyAdmin
};
