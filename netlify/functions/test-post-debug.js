// 简单的POST请求测试函数
exports.handler = async (event, context) => {
  console.log('🔍 接收到请求:', event.httpMethod, event.body);
  
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

  // 测试POST请求
  if (event.httpMethod === 'POST') {
    console.log('✅ POST请求被正确识别');
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('📝 请求数据:', body);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: '✅ POST请求处理成功',
          data: {
            method: event.httpMethod,
            receivedData: body,
            timestamp: new Date().toISOString()
          }
        })
      };
    } catch (error) {
      console.error('❌ POST请求处理失败:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '请求处理失败',
          details: error.message
        })
      };
    }
  }

  // 默认GET请求
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: '这是GET请求响应',
      method: event.httpMethod
    })
  };
}; 