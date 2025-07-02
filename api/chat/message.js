const { connectToDatabase } = require('../../lib/database');
const { corsHeaders, optionalAuth } = require('../../lib/auth');

// 简单的AI回复逻辑
const getAIResponse = async (userMessage, sessionHistory = []) => {
  const startTime = Date.now();
  
  // 门窗相关的知识库
  const knowledgeBase = {
    '价格': '我们的门窗价格根据材质、尺寸和工艺而定。铝合金门窗价格在300-800元/平方米，断桥铝门窗在600-1200元/平方米。具体价格需要根据您的需求进行测量报价。',
    '材质': '我们提供多种材质选择：1.铝合金门窗-经济实用，防腐性强；2.断桥铝门窗-隔热保温效果好；3.塑钢门窗-密封性好，价格适中；4.实木门窗-美观大方，环保自然。',
    '安装': '我们提供专业的安装服务：1.免费上门测量；2.专业技术团队施工；3.严格按照国家标准安装；4.提供售后保修服务。安装周期通常为3-7个工作日。',
    '售后': '我们提供完善的售后服务：1.产品质保5年；2.免费上门维修；3.配件终身供应；4.24小时客服热线。有任何问题都可以联系我们。',
    '测量': '我们提供免费上门测量服务：1.专业技术员上门；2.精确测量尺寸；3.现场沟通方案；4.提供详细报价。预约测量请提供您的联系方式和地址。',
    '工艺': '我们采用先进的生产工艺：1.精密数控加工；2.多道质检程序；3.环保喷涂工艺；4.严格的组装标准。确保每一扇门窗都达到最高品质。'
  };
  
  const message = userMessage.toLowerCase();
  let response = '';
  
  // 简单的关键词匹配
  for (const [keyword, answer] of Object.entries(knowledgeBase)) {
    if (message.includes(keyword) || message.includes(keyword.toLowerCase())) {
      response = answer;
      break;
    }
  }
  
  // 如果没有匹配到，使用默认回复
  if (!response) {
    const defaultResponses = [
      '感谢您的咨询！我是宝得利门窗的智能客服助手。您可以询问关于门窗的价格、材质、安装、售后等问题，我会为您详细解答。',
      '您好！我可以为您介绍我们的门窗产品和服务。如需详细咨询或转接人工客服，请随时告诉我。',
      '欢迎咨询宝得利门窗！我们专业生产各类门窗产品，如果您有特殊需求或需要人工服务，请说"转人工"。'
    ];
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  // 检查是否需要转人工
  const needHumanKeywords = ['转人工', '人工客服', '联系客服', '找客服', '投诉', '问题', '不满意'];
  const needHuman = needHumanKeywords.some(keyword => message.includes(keyword));
  
  if (needHuman) {
    response += '\n\n我已为您转接人工客服，请稍等片刻。您也可以留下您的联系方式，我们会主动联系您。';
  }
  
  const responseTime = Date.now() - startTime;
  
  return {
    response,
    needHuman,
    responseTime
  };
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
    const { ChatMessage, User } = await connectToDatabase();
    const { sessionId, message, userName, userPhone } = req.body;
    
    // 可选身份验证
    const authResult = await optionalAuth(req);
    const userId = authResult.success ? authResult.user.userId : null;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: '会话ID和消息内容不能为空'
      });
    }
    
    // 检查当前会话状态
    const lastMessage = await ChatMessage.findOne({
      where: { sessionId },
      order: [['createdAt', 'DESC']]
    });
    
    const currentSessionStatus = lastMessage?.sessionStatus || 'ai_only';
    const now = new Date();
    
    // 检查是否需要人工服务
    const needHumanKeywords = ['转人工', '人工客服', '联系客服', '找客服', '投诉', '问题', '不满意'];
    const needHuman = needHumanKeywords.some(keyword => message.includes(keyword));
    
    // 确定消息的会话状态
    let messageSessionStatus = currentSessionStatus;
    if (needHuman && currentSessionStatus === 'ai_only') {
      messageSessionStatus = 'human_requested';
    }
    
    // 保存用户消息
    const userMessage = await ChatMessage.create({
      userId,
      sessionId,
      message,
      senderType: 'user',
      needHumanReply: needHuman || currentSessionStatus === 'human_active',
      sessionStatus: messageSessionStatus,
      lastHumanActivity: currentSessionStatus === 'human_active' ? now : null,
      userName: userName || authResult.user?.name || '访客',
      userPhone: userPhone || authResult.user?.phone || null
    });
    
    // 检查是否应该生成AI回复
    let aiMessage = null;
    let shouldGenerateAIReply = true;
    
    // 如果会话状态为人工请求或人工活跃，检查是否在3分钟内
    if (messageSessionStatus === 'human_requested' || currentSessionStatus === 'human_active') {
      const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
      
      if (messageSessionStatus === 'human_requested') {
        // 刚转人工，不生成AI回复
        shouldGenerateAIReply = false;
      } else if (currentSessionStatus === 'human_active') {
        // 检查最后一次人工活动时间
        const lastHumanActivity = lastMessage?.lastHumanActivity;
        if (lastHumanActivity && new Date(lastHumanActivity) > threeMinutesAgo) {
          // 3分钟内有人工活动，AI暂停回复
          shouldGenerateAIReply = false;
        } else {
          // 超过3分钟无人工活动，恢复AI服务并重置状态
          messageSessionStatus = 'ai_only';
          await ChatMessage.update(
            { sessionStatus: 'ai_only' },
            { where: { sessionId, sessionStatus: 'human_active' } }
          );
        }
      }
    }
    
    if (shouldGenerateAIReply) {
      // 获取会话历史（用于AI上下文）
      const sessionHistory = await ChatMessage.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
        limit: 10 // 只获取最近10条消息作为上下文
      });
      
      // 获取AI回复
      const aiResult = await getAIResponse(message, sessionHistory);
      
      // 保存AI回复
      aiMessage = await ChatMessage.create({
        userId,
        sessionId,
        message: aiResult.response,
        senderType: 'ai',
        needHumanReply: false,
        aiResponseTime: aiResult.responseTime,
        sessionStatus: messageSessionStatus
      });
    }
    
    // 构建响应数据
    const responseData = {
      userMessage,
      sessionStatus: messageSessionStatus
    };
    
    if (aiMessage) {
      responseData.aiMessage = aiMessage;
    }
    
    res.json({
      success: true,
      data: responseData,
      message: '消息发送成功'
    });
    
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败'
    });
  }
} 