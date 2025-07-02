# 宝得利门窗聊天系统使用指南

## 📋 功能概述

宝得利门窗聊天系统是一个完整的在线客服解决方案，支持：
- ✅ AI智能回答（基于门窗知识库）
- ✅ 人工客服转接
- ✅ 用户对话记录
- ✅ 管理员客服管理
- ✅ 匿名用户咨询
- ✅ 实时消息交互

## 🚀 快速开始

### 用户端访问
1. 访问网站首页
2. 点击导航栏"联系我们"
3. 直接开始对话

### 管理员端
1. 登录管理后台：`/admin/login`
2. 在管理首页点击"客服管理"
3. 查看待处理咨询并回复

## 💻 技术架构

### 后端架构
```
server/
├── models/sequelize/
│   └── ChatMessage.js          # 聊天消息模型
├── routes/
│   └── chat.js                 # 聊天API路由
└── middleware/
    └── auth.js                 # 认证中间件
```

### 前端架构
```
client/src/
├── views/
│   ├── Chat.vue                # 用户聊天界面
│   └── ChatAdmin.vue           # 管理员客服管理
├── components/
│   └── Header.vue              # 添加了"联系我们"入口
└── router/
    └── index.js                # 聊天相关路由
```

## 🗄️ 数据库设计

### ChatMessage 表结构
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,                -- 用户ID（可为空，支持匿名）
  sessionId VARCHAR(255) NOT NULL, -- 会话ID
  message TEXT NOT NULL,         -- 消息内容
  senderType ENUM('user', 'ai', 'human'), -- 发送者类型
  messageType ENUM('text', 'image', 'file'), -- 消息类型
  isRead BOOLEAN DEFAULT FALSE,  -- 是否已读
  needHumanReply BOOLEAN DEFAULT FALSE, -- 是否需要人工回复
  aiResponseTime INTEGER,        -- AI响应时间（毫秒）
  userName VARCHAR(255),         -- 用户姓名
  userPhone VARCHAR(255),        -- 用户手机号
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### 索引优化
- `sessionId` - 按会话查询
- `userId` - 按用户查询
- `createdAt` - 时间排序
- `needHumanReply` - 待处理筛选

## 🔧 API 接口

### 基础聊天接口
```bash
# 创建/获取会话
POST /api/chat/session
Body: { "sessionId": "optional" }

# 发送消息
POST /api/chat/message
Body: {
  "sessionId": "session_xxx",
  "message": "用户消息",
  "userName": "可选",
  "userPhone": "可选"
}

# 获取会话历史
GET /api/chat/history/:sessionId
Query: ?page=1&limit=50

# 转人工客服
POST /api/chat/request-human/:sessionId
Body: { "message": "可选转接原因" }
```

### 管理员接口
```bash
# 获取待处理咨询
GET /api/chat/admin/pending
Headers: Authorization: Bearer <admin_token>

# 管理员回复
POST /api/chat/admin/reply
Headers: Authorization: Bearer <admin_token>
Body: {
  "sessionId": "session_xxx",
  "message": "管理员回复"
}
```

## 🤖 AI 知识库

### 预设话题
- **价格咨询**: 根据材质和工艺提供价格区间
- **材质介绍**: 铝合金、断桥铝、塑钢、实木等材质特点
- **安装服务**: 免费测量、专业安装、售后保修
- **工艺流程**: 数控加工、质检、喷涂、组装标准
- **售后服务**: 5年质保、终身配件、24小时客服

### 关键词触发
```javascript
const knowledgeBase = {
  '价格': '价格根据材质、尺寸和工艺而定...',
  '材质': '我们提供多种材质选择...',
  '安装': '我们提供专业的安装服务...',
  '售后': '我们提供完善的售后服务...',
  '测量': '我们提供免费上门测量服务...',
  '工艺': '我们采用先进的生产工艺...'
}
```

### 转人工触发词
- "转人工"
- "人工客服"
- "联系客服"
- "找客服"
- "投诉"
- "问题"
- "不满意"

## 🎨 用户界面

### 聊天页面功能
- 💬 实时消息显示
- ⌨️ 智能输入框（支持Enter发送）
- 🔄 AI思考状态指示
- 👨‍💼 一键转人工按钮
- 📱 响应式设计（移动端适配）

### 管理员界面功能
- 📊 待处理咨询统计
- 📋 咨询列表展示
- 💬 会话历史查看
- ✍️ 快速回复功能
- 🔄 实时刷新

## 🔐 安全特性

### 认证机制
- 可选认证：支持匿名用户咨询
- JWT Token：管理员功能需要认证
- 权限控制：管理员API有权限验证

### 数据保护
- 用户信息加密存储
- 会话ID随机生成
- SQL注入防护
- XSS攻击防护

## 📊 统计功能

### 用户端统计
- 会话消息数量
- AI响应时间
- 转人工请求数

### 管理端统计
- 待处理咨询数
- 今日处理量
- 活跃用户数
- 响应时间统计

## 🛠️ 部署说明

### 环境要求
- Node.js >= 14.0
- SQLite3 数据库
- 前端构建工具（Vite）

### 启动步骤
```bash
# 1. 后端启动
cd server
npm install
npm start

# 2. 前端启动
cd client
npm install
npm run dev
```

### 数据库初始化
```bash
cd server
node scripts/initDB.js
```

## 🔄 扩展功能

### 可扩展的AI服务
当前使用简单的关键词匹配，可以轻松集成：
- OpenAI GPT
- 百度文心一言
- 阿里通义千问
- 自定义AI模型

### 消息类型扩展
- 图片消息支持
- 文件传输功能
- 语音消息功能
- 视频通话集成

### 高级功能
- 消息推送通知
- 客服工作量统计
- 用户满意度评价
- 多语言支持

## 📝 使用示例

### 用户咨询流程
1. 用户访问 `/chat` 页面
2. 系统自动生成会话ID
3. 用户发送"我想了解门窗价格"
4. AI回复价格相关信息
5. 用户如需详细咨询，可点击"转人工"
6. 管理员接收通知并回复

### 管理员处理流程
1. 管理员登录后台
2. 查看 `/admin/chat` 页面
3. 看到有"3个待处理咨询"
4. 点击咨询条目查看详情
5. 在对话框中回复用户
6. 系统自动标记为已处理

## 🎯 最佳实践

### 用户体验优化
- 快速响应（AI回复1-2秒内）
- 友好的错误提示
- 清晰的操作指引
- 移动端优化

### 客服管理优化
- 及时处理转人工请求
- 建立标准回复模板
- 定期更新知识库
- 监控服务质量

---

## 📞 技术支持

如有技术问题，请联系开发团队或参考相关文档。

**版本**: v1.0.0  
**更新时间**: 2025年7月1日 