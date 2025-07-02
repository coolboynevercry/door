import { apiHandler, verifyAdminCredentials, generateToken, createApiResponse } from '../../lib/auth.js';
import { validators } from '../../lib/utils.js';

export default apiHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return createApiResponse(false, null, '方法不允许', 405);
  }

  try {
    const { username, password } = req.body;

    // 输入验证
    if (!validators.required(username) || !validators.required(password)) {
      return createApiResponse(false, null, '用户名和密码不能为空', 400);
    }

    // 验证管理员凭据
    if (!verifyAdminCredentials(username, password)) {
      return createApiResponse(false, null, '用户名或密码错误', 401);
    }

    // 生成JWT token
    const token = generateToken({
      username,
      type: 'admin',
      loginTime: new Date().toISOString()
    }, '24h');

    return createApiResponse(true, {
      token,
      admin: {
        username,
        type: 'admin',
        loginTime: new Date().toISOString()
      }
    }, '登录成功');

  } catch (error) {
    console.error('Admin login error:', error);
    return createApiResponse(false, null, '登录失败，请稍后重试', 500);
  }
}); 