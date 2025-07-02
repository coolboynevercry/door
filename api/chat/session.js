const { connectToDatabase } = require('../../lib/database');
const { corsHeaders, optionalAuth } = require('../../lib/auth');

// 生成会话ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不允许'
    });
  }

  try {
    const { ChatMessage } = await connectToDatabase();
    const { sessionId } = req.body;
    
    // 可选身份验证
    const authResult = await optionalAuth(req);
    const userId = authResult.success ? authResult.user.userId : null;
    
    let finalSessionId = sessionId;
    if (!finalSessionId) {
      finalSessionId = generateSessionId();
    }
    
    // 获取会话历史
    const messages = await ChatMessage.findAll({
      where: { sessionId: finalSessionId },
      order: [['createdAt', 'ASC']],
      limit: 100 // 限制消息数量
    });
    
    res.json({
      success: true,
      data: {
        sessionId: finalSessionId,
        messages
      }
    });
  } catch (error) {
    console.error('获取会话失败:', error);
    res.status(500).json({
      success: false,
      message: '获取会话失败'
    });
  }
} 