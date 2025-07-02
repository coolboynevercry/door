import { apiHandler } from '../lib/auth.js';
import { healthCheck } from '../lib/database.js';

export default apiHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return {
      success: false,
      message: '方法不允许',
      statusCode: 405
    };
  }

  try {
    // 检查数据库连接
    const dbHealth = await healthCheck();
    
    // 基本健康信息
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        runtime: 'nodejs18.x'
      }
    };

    return {
      success: true,
      data: health,
      message: '服务运行正常'
    };
  } catch (error) {
    return {
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      message: '服务异常',
      statusCode: 500
    };
  }
}); 