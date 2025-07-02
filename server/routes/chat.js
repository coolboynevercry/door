const express = require('express')
const { Op } = require('sequelize')
const { ChatMessage, User } = require('../models/sequelize')
const auth = require('../middleware/auth')

const router = express.Router()

// 对所有聊天路由应用可选认证
router.use(auth.optionalAuth)

// 生成会话ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 简单的AI回复逻辑（这里可以后续集成真正的AI服务）
const getAIResponse = async (userMessage, sessionHistory = []) => {
  const startTime = Date.now()
  
  // 门窗相关的知识库
  const knowledgeBase = {
    '价格': '我们的门窗价格根据材质、尺寸和工艺而定。铝合金门窗价格在300-800元/平方米，断桥铝门窗在600-1200元/平方米。具体价格需要根据您的需求进行测量报价。',
    '材质': '我们提供多种材质选择：1.铝合金门窗-经济实用，防腐性强；2.断桥铝门窗-隔热保温效果好；3.塑钢门窗-密封性好，价格适中；4.实木门窗-美观大方，环保自然。',
    '安装': '我们提供专业的安装服务：1.免费上门测量；2.专业技术团队施工；3.严格按照国家标准安装；4.提供售后保修服务。安装周期通常为3-7个工作日。',
    '售后': '我们提供完善的售后服务：1.产品质保5年；2.免费上门维修；3.配件终身供应；4.24小时客服热线。有任何问题都可以联系我们。',
    '测量': '我们提供免费上门测量服务：1.专业技术员上门；2.精确测量尺寸；3.现场沟通方案；4.提供详细报价。预约测量请提供您的联系方式和地址。',
    '工艺': '我们采用先进的生产工艺：1.精密数控加工；2.多道质检程序；3.环保喷涂工艺；4.严格的组装标准。确保每一扇门窗都达到最高品质。'
  }
  
  const message = userMessage.toLowerCase()
  let response = ''
  
  // 简单的关键词匹配
  for (const [keyword, answer] of Object.entries(knowledgeBase)) {
    if (message.includes(keyword) || message.includes(keyword.toLowerCase())) {
      response = answer
      break
    }
  }
  
  // 如果没有匹配到，使用默认回复
  if (!response) {
    const defaultResponses = [
      '感谢您的咨询！我是宝得利门窗的智能客服助手。您可以询问关于门窗的价格、材质、安装、售后等问题，我会为您详细解答。',
      '您好！我可以为您介绍我们的门窗产品和服务。如需详细咨询或转接人工客服，请随时告诉我。',
      '欢迎咨询宝得利门窗！我们专业生产各类门窗产品，如果您有特殊需求或需要人工服务，请说"转人工"。'
    ]
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }
  
  // 检查是否需要转人工
  const needHumanKeywords = ['转人工', '人工客服', '联系客服', '找客服', '投诉', '问题', '不满意']
  const needHuman = needHumanKeywords.some(keyword => message.includes(keyword))
  
  if (needHuman) {
    response += '\n\n我已为您转接人工客服，请稍等片刻。您也可以留下您的联系方式，我们会主动联系您。'
  }
  
  const responseTime = Date.now() - startTime
  
  return {
    response,
    needHuman,
    responseTime
  }
}

// 获取或创建会话
router.post('/session', async (req, res) => {
  try {
    const { sessionId } = req.body
    const userId = req.user?.id || null
    
    let finalSessionId = sessionId
    if (!finalSessionId) {
      finalSessionId = generateSessionId()
    }
    
    // 获取会话历史
    const messages = await ChatMessage.findAll({
      where: { sessionId: finalSessionId },
      order: [['createdAt', 'ASC']],
      limit: 100 // 限制消息数量
    })
    
    res.json({
      success: true,
      data: {
        sessionId: finalSessionId,
        messages
      }
    })
  } catch (error) {
    console.error('获取会话失败:', error)
    res.status(500).json({
      success: false,
      message: '获取会话失败'
    })
  }
})

// 发送消息
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, userName, userPhone } = req.body
    const userId = req.user?.id || null
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: '会话ID和消息内容不能为空'
      })
    }
    
    // 检查当前会话状态
    const lastMessage = await ChatMessage.findOne({
      where: { sessionId },
      order: [['createdAt', 'DESC']]
    })
    
    const currentSessionStatus = lastMessage?.sessionStatus || 'ai_only'
    const now = new Date()
    
    // 检查是否需要人工服务（在保存消息前）
    const needHumanKeywords = ['转人工', '人工客服', '联系客服', '找客服', '投诉', '问题', '不满意']
    const needHuman = needHumanKeywords.some(keyword => message.includes(keyword))
    
    // 确定消息的会话状态
    let messageSessionStatus = currentSessionStatus
    if (needHuman && currentSessionStatus === 'ai_only') {
      messageSessionStatus = 'human_requested'
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
      userName: userName || req.user?.name || '访客',
      userPhone: userPhone || req.user?.phone || null
    })
    
    // 检查是否应该生成AI回复
    let aiMessage = null
    let shouldGenerateAIReply = true
    
    // 如果会话状态为人工请求或人工活跃，检查是否在3分钟内
    if (messageSessionStatus === 'human_requested' || currentSessionStatus === 'human_active') {
      const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000)
      
      if (messageSessionStatus === 'human_requested') {
        // 刚转人工，不生成AI回复
        shouldGenerateAIReply = false
      } else if (currentSessionStatus === 'human_active') {
        // 检查最后一次人工活动时间
        const lastHumanActivity = lastMessage?.lastHumanActivity
        if (lastHumanActivity && new Date(lastHumanActivity) > threeMinutesAgo) {
          // 3分钟内有人工活动，AI暂停回复
          shouldGenerateAIReply = false
        } else {
          // 超过3分钟无人工活动，恢复AI服务并重置状态
          messageSessionStatus = 'ai_only'
          await ChatMessage.update(
            { sessionStatus: 'ai_only' },
            { where: { sessionId, sessionStatus: 'human_active' } }
          )
        }
      }
    }
    
    if (shouldGenerateAIReply) {
      // 获取会话历史（用于AI上下文）
      const sessionHistory = await ChatMessage.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
        limit: 10 // 只获取最近10条消息作为上下文
      })
      
      // 获取AI回复
      const aiResult = await getAIResponse(message, sessionHistory)
      
      // 保存AI回复
      aiMessage = await ChatMessage.create({
        userId,
        sessionId,
        message: aiResult.response,
        senderType: 'ai',
        needHumanReply: false,  // AI回复本身不需要人工处理
        aiResponseTime: aiResult.responseTime,
        sessionStatus: messageSessionStatus
      })
    }
    
    // 构建响应数据
    const responseData = {
      userMessage,
      needHuman: needHuman || (messageSessionStatus === 'human_requested') || (currentSessionStatus === 'human_active')
    }
    
    if (aiMessage) {
      responseData.aiMessage = aiMessage
    }
    
    res.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    res.status(500).json({
      success: false,
      message: '发送消息失败'
    })
  }
})

// 获取会话历史
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { page = 1, limit = 50 } = req.query
    
    const offset = (page - 1) * limit
    
    const { count, rows: messages } = await ChatMessage.findAndCountAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    res.json({
      success: true,
      data: {
        messages,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取会话历史失败:', error)
    res.status(500).json({
      success: false,
      message: '获取会话历史失败'
    })
  }
})

// 标记消息为已读
router.put('/read/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    
    await ChatMessage.update(
      { isRead: true },
      { where: { id: messageId } }
    )
    
    res.json({
      success: true,
      message: '标记已读成功'
    })
  } catch (error) {
    console.error('标记已读失败:', error)
    res.status(500).json({
      success: false,
      message: '标记已读失败'
    })
  }
})

// 转人工客服
router.post('/request-human/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { message } = req.body
    const userId = req.user?.id || null
    
    // 创建转人工请求消息
    await ChatMessage.create({
      userId,
      sessionId,
      message: message || '用户请求转接人工客服',
      senderType: 'user',
      needHumanReply: true,
      sessionStatus: 'human_requested'
    })
    
    // 创建系统回复
    await ChatMessage.create({
      userId,
      sessionId,
      message: '您的请求已转接给人工客服，请稍等片刻。工作时间：9:00-18:00，非工作时间请留言，我们会尽快回复。',
      senderType: 'ai',
      needHumanReply: false,
      sessionStatus: 'human_requested'
    })
    
    res.json({
      success: true,
      message: '已转接人工客服'
    })
  } catch (error) {
    console.error('转接人工失败:', error)
    res.status(500).json({
      success: false,
      message: '转接人工失败'
    })
  }
})

// 管理员获取待处理的人工客服请求
router.get('/admin/pending', auth.verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    
    const { count, rows: sessions } = await ChatMessage.findAndCountAll({
      where: {
        needHumanReply: true,
        senderType: 'user'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    res.json({
      success: true,
      data: {
        sessions,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取待处理请求失败:', error)
    res.status(500).json({
      success: false,
      message: '获取待处理请求失败'
    })
  }
})

// 管理员回复消息
router.post('/admin/reply', auth.verifyAdmin, async (req, res) => {
  try {
    const { sessionId, message } = req.body
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: '会话ID和消息内容不能为空'
      })
    }
    
    const now = new Date()
    
    // 创建管理员回复
    await ChatMessage.create({
      sessionId,
      message,
      senderType: 'human',
      sessionStatus: 'human_active',
      lastHumanActivity: now
    })
    
    // 更新该会话的状态为人工活跃，但不结束对话
    await ChatMessage.update(
      { 
        sessionStatus: 'human_active',
        lastHumanActivity: now
      },
      { 
        where: { 
          sessionId,
          sessionStatus: 'human_requested'
        } 
      }
    )
    
    res.json({
      success: true,
      message: '回复成功'
    })
  } catch (error) {
    console.error('管理员回复失败:', error)
    res.status(500).json({
      success: false,
      message: '回复失败'
    })
  }
})

// 获取活跃的人工会话
router.get('/admin/active-sessions', auth.verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    
    // 获取所有活跃的人工会话（按sessionId分组，取每个会话的最新消息）
    const activeSessions = await ChatMessage.findAll({
      attributes: [
        'sessionId',
        [ChatMessage.sequelize.fn('MAX', ChatMessage.sequelize.col('createdAt')), 'lastMessageTime'],
        [ChatMessage.sequelize.fn('MAX', ChatMessage.sequelize.col('lastHumanActivity')), 'lastActivity']
      ],
      where: {
        sessionStatus: ['human_requested', 'human_active']
      },
      group: ['sessionId'],
      order: [[ChatMessage.sequelize.fn('MAX', ChatMessage.sequelize.col('lastHumanActivity')), 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    // 获取每个会话的详细信息
    const sessionDetails = await Promise.all(
      activeSessions.map(async (session) => {
        const latestMessage = await ChatMessage.findOne({
          where: { sessionId: session.sessionId },
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'phone']
          }]
        })
        
        const messageCount = await ChatMessage.count({
          where: { 
            sessionId: session.sessionId,
            needHumanReply: true,
            senderType: 'user'
          }
        })
        
        return {
          sessionId: session.sessionId,
          lastMessageTime: session.dataValues.lastMessageTime,
          lastActivity: session.dataValues.lastActivity,
          latestMessage,
          pendingCount: messageCount
        }
      })
    )
    
    res.json({
      success: true,
      data: {
        sessions: sessionDetails,
        total: activeSessions.length
      }
    })
  } catch (error) {
    console.error('获取活跃会话失败:', error)
    res.status(500).json({
      success: false,
      message: '获取活跃会话失败'
    })
  }
})

// 结束人工会话
router.post('/admin/end-session/:sessionId', auth.verifyAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params
    const now = new Date()
    
    // 更新该会话的所有消息状态为已结束
    await ChatMessage.update(
      { 
        sessionStatus: 'human_ended',
        needHumanReply: false
      },
      { 
        where: { 
          sessionId,
          sessionStatus: ['human_requested', 'human_active']
        } 
      }
    )
    
    // 添加系统消息表示会话结束
    await ChatMessage.create({
      sessionId,
      message: '人工客服已结束此次对话。如有其他问题，请重新发起咨询。',
      senderType: 'ai',
      sessionStatus: 'human_ended'
    })
    
    res.json({
      success: true,
      message: '会话已结束'
    })
  } catch (error) {
    console.error('结束会话失败:', error)
    res.status(500).json({
      success: false,
      message: '结束会话失败'
    })
  }
})

// 清理超时会话（3分钟无活动）
router.post('/admin/cleanup-timeout', auth.verifyAdmin, async (req, res) => {
  try {
    const timeoutMinutes = 3
    const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000)
    
    // 查找超时的活跃会话
    const timeoutSessions = await ChatMessage.findAll({
      attributes: ['sessionId'],
      where: {
        sessionStatus: 'human_active',
        lastHumanActivity: {
          [Op.lt]: timeoutDate
        }
      },
      group: ['sessionId']
    })
    
    let cleanupCount = 0
    
    // 结束超时会话
    for (const session of timeoutSessions) {
      await ChatMessage.update(
        { 
          sessionStatus: 'human_ended',
          needHumanReply: false
        },
        { 
          where: { 
            sessionId: session.sessionId,
            sessionStatus: 'human_active'
          } 
        }
      )
      
      // 添加超时结束消息
      await ChatMessage.create({
        sessionId: session.sessionId,
        message: '由于长时间无响应，人工客服对话已自动结束。如有其他问题，请重新发起咨询。',
        senderType: 'ai',
        sessionStatus: 'human_ended'
      })
      
      cleanupCount++
    }
    
    res.json({
      success: true,
      message: `已清理 ${cleanupCount} 个超时会话`
    })
  } catch (error) {
    console.error('清理超时会话失败:', error)
    res.status(500).json({
      success: false,
      message: '清理超时会话失败'
    })
  }
})

module.exports = router 