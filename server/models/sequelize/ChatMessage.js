const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // 允许匿名用户
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false, // 用于标识会话，匿名用户使用随机生成的sessionId
      index: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    senderType: {
      type: DataTypes.ENUM('user', 'ai', 'human'),
      allowNull: false,
      defaultValue: 'user'
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    needHumanReply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    aiResponseTime: {
      type: DataTypes.INTEGER, // 毫秒
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true // 用于记录用户名（包括匿名用户）
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: true // 用于记录用户手机号
    },
    sessionStatus: {
      type: DataTypes.ENUM('ai_only', 'human_requested', 'human_active', 'human_ended'),
      defaultValue: 'ai_only',
      comment: '会话状态: ai_only-纯AI对话, human_requested-请求人工, human_active-人工活跃, human_ended-人工结束'
    },
    lastHumanActivity: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后一次人工活动时间'
    }
  }, {
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['sessionId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['needHumanReply']
      },
      {
        fields: ['sessionStatus']
      },
      {
        fields: ['lastHumanActivity']
      }
    ]
  })

  return ChatMessage
} 