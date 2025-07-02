// 环境变量检查工具
exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // 检查所有可能的数据库环境变量
    const envVars = {
      // Netlify Neon相关
      NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL,
      NETLIFY_DATABASE_URL_UNPOOLED: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
      
      // Neon相关
      NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
      NEON_BRANCH: process.env.NEON_BRANCH,
      NEON_USER: process.env.NEON_USER,
      NEON_PASSWORD: process.env.NEON_PASSWORD,
      NEON_HOST: process.env.NEON_HOST,
      NEON_PORT: process.env.NEON_PORT,
      NEON_DATABASE: process.env.NEON_DATABASE,
      
      // 通用数据库
      DATABASE_URL: process.env.DATABASE_URL,
      POSTGRES_URL: process.env.POSTGRES_URL,
      
      // 其他数据库
      SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
      RAILWAY_DATABASE_URL: process.env.RAILWAY_DATABASE_URL,
      
      // Netlify相关
      NETLIFY_DEV: process.env.NETLIFY_DEV,
      CONTEXT: process.env.CONTEXT,
      DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL
    };

    // 检查哪些变量存在
    const availableVars = {};
    const maskedVars = {};
    
    Object.keys(envVars).forEach(key => {
      if (envVars[key]) {
        availableVars[key] = true;
        // 隐藏敏感信息
        if (key.includes('URL') || key.includes('PASSWORD')) {
          maskedVars[key] = envVars[key].replace(/:[^:@]+@/, ':***@').replace(/\/\/[^:]+:/, '//***:');
        } else {
          maskedVars[key] = envVars[key];
        }
      } else {
        availableVars[key] = false;
      }
    });

    // 确定优先使用的数据库URL
    const selectedDb = process.env.NETLIFY_DATABASE_URL || 
                      process.env.NEON_DATABASE_URL || 
                      process.env.DATABASE_URL ||
                      process.env.SUPABASE_DB_URL || 
                      process.env.RAILWAY_DATABASE_URL || 
                      process.env.POSTGRES_URL;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          platform: 'netlify',
          environment_variables: {
            available: availableVars,
            masked_values: maskedVars,
            selected_database: selectedDb ? selectedDb.replace(/:[^:@]+@/, ':***@') : null
          },
          recommendations: {
            neon_configured: !!(process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL),
            database_available: !!selectedDb,
            next_steps: !selectedDb ? [
              "访问 https://app.netlify.com/projects/baodeli-door/extensions/neon",
              "完成Neon数据库配置",
              "重新部署站点"
            ] : [
              "数据库连接已配置",
              "可以运行 init-database 初始化数据库"
            ]
          },
          message: '环境变量检查完成'
        }
      })
    };

  } catch (error) {
    console.error('环境变量检查失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: '环境变量检查失败',
        message: error.message
      })
    };
  }
}; 