<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b px-4 py-3">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <div class="flex items-center space-x-3">
          <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeftIcon class="w-5 h-5 text-gray-600" />
          </button>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 class="font-semibold text-gray-900">在线客服</h1>
              <p class="text-xs text-gray-500">
                {{ isConnected ? '在线' : '连接中...' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="requestHuman" 
            :disabled="requestingHuman"
            class="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
          >
            {{ requestingHuman ? '转接中...' : '转人工' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 overflow-hidden">
      <div class="max-w-4xl mx-auto h-full flex flex-col">
        <!-- Messages List -->
        <div 
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          <!-- Messages -->
          <div v-for="message in messages" :key="message.id" class="flex" :class="getMessageAlignment(message)">
            <div class="max-w-xs lg:max-w-md">
              <!-- Message Bubble -->
              <div class="px-4 py-2 rounded-2xl" :class="getMessageStyle(message)">
                <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
              </div>
              
              <!-- Message Info -->
              <div class="flex items-center space-x-2 mt-1 px-2" :class="getMessageAlignment(message)">
                <span class="text-xs text-gray-500">
                  {{ getSenderName(message) }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ formatTime(message.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="max-w-xs lg:max-w-md">
              <div class="bg-gray-200 px-4 py-2 rounded-2xl">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
              <div class="text-xs text-gray-500 mt-1 px-2">AI助手正在输入...</div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t bg-white p-4">
          <div class="flex items-end space-x-3">
            <!-- Message Input -->
            <div class="flex-1">
              <textarea
                v-model="messageInput"
                ref="messageTextarea"
                @keydown="handleKeyDown"
                :disabled="sending"
                class="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                placeholder="输入消息..."
                rows="1"
              ></textarea>
            </div>
            
            <!-- Send Button -->
            <button
              @click="sendMessage"
              :disabled="!messageInput.trim() || sending"
              class="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon 
} from '@heroicons/vue/24/outline'
import { useUserStore } from '../stores'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const messages = ref([])
const messageInput = ref('')
const sessionId = ref('')
const isConnected = ref(false)
const isTyping = ref(false)
const sending = ref(false)
const requestingHuman = ref(false)

// DOM引用
const messagesContainer = ref(null)
const messageTextarea = ref(null)

// 生成会话ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 获取或创建会话
const initializeSession = async () => {
  try {
    isConnected.value = false
    
    // 从localStorage获取或生成新的sessionId
    let storedSessionId = localStorage.getItem('chat_session_id')
    if (!storedSessionId) {
      storedSessionId = generateSessionId()
      localStorage.setItem('chat_session_id', storedSessionId)
    }
    
    const response = await fetch('/api/chat/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userStore.token && { 'Authorization': `Bearer ${userStore.token}` })
      },
      body: JSON.stringify({ sessionId: storedSessionId })
    })
    
    const result = await response.json()
    
    if (result.success) {
      sessionId.value = result.data.sessionId
      messages.value = result.data.messages || []
      isConnected.value = true
      
      // 如果是新会话，发送欢迎消息
      if (messages.value.length === 0) {
        await sendWelcomeMessage()
      }
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('初始化会话失败:', error)
  }
}

// 发送欢迎消息
const sendWelcomeMessage = async () => {
  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userStore.token && { 'Authorization': `Bearer ${userStore.token}` })
      },
      body: JSON.stringify({
        sessionId: sessionId.value,
        message: '你好',
        userName: userStore.user?.name,
        userPhone: userStore.user?.phone
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      messages.value.push(result.data.userMessage)
      messages.value.push(result.data.aiMessage)
      
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('发送欢迎消息失败:', error)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || sending.value) return
  
  const message = messageInput.value.trim()
  messageInput.value = ''
  
  sending.value = true
  isTyping.value = true
  
  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userStore.token && { 'Authorization': `Bearer ${userStore.token}` })
      },
      body: JSON.stringify({
        sessionId: sessionId.value,
        message,
        userName: userStore.user?.name,
        userPhone: userStore.user?.phone
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 添加用户消息
      messages.value.push(result.data.userMessage)
      
      await nextTick()
      scrollToBottom()
      
      // 模拟AI思考时间
      setTimeout(() => {
        isTyping.value = false
        // 添加AI回复
        messages.value.push(result.data.aiMessage)
        
        // 如果AI检测到需要人工服务，自动刷新消息列表以确保管理员能看到
        if (result.data.needHuman) {
          console.log('检测到需要人工服务，标记消息为待处理')
        }
        
        nextTick(() => {
          scrollToBottom()
        })
      }, 1000)
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    isTyping.value = false
  } finally {
    sending.value = false
  }
}

// 转人工客服
const requestHuman = async () => {
  if (requestingHuman.value) return
  
  requestingHuman.value = true
  
  try {
    const response = await fetch(`/api/chat/request-human/${sessionId.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userStore.token && { 'Authorization': `Bearer ${userStore.token}` })
      },
      body: JSON.stringify({
        message: '用户请求转接人工客服'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 重新获取消息列表
      await loadMessages()
    }
  } catch (error) {
    console.error('转接人工失败:', error)
  } finally {
    requestingHuman.value = false
  }
}

// 加载消息
const loadMessages = async () => {
  try {
    const response = await fetch(`/api/chat/history/${sessionId.value}`)
    const result = await response.json()
    
    if (result.success) {
      messages.value = result.data.messages
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

// 键盘事件处理
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 获取消息对齐方式
const getMessageAlignment = (message) => {
  return message.senderType === 'user' ? 'justify-end' : 'justify-start'
}

// 获取消息样式
const getMessageStyle = (message) => {
  if (message.senderType === 'user') {
    return 'bg-primary-600 text-white'
  } else if (message.senderType === 'ai') {
    return 'bg-gray-200 text-gray-900'
  } else {
    return 'bg-green-100 text-green-800'
  }
}

// 获取发送者名称
const getSenderName = (message) => {
  if (message.senderType === 'user') {
    return message.userName || '我'
  } else if (message.senderType === 'ai') {
    return 'AI助手'
  } else {
    return '人工客服'
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return Math.floor(diff / 60000) + '分钟前'
  } else {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 组件挂载
onMounted(() => {
  initializeSession()
})
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1.4s infinite;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}
</style> 