// 最简单的测试API - 用于验证Vercel函数保护问题
module.exports = (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 返回测试成功消息
  res.status(200).json({
    success: true,
    message: '🎉 API测试成功！认证保护已解除！',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers
  });
}; 