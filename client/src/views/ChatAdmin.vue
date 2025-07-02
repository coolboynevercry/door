<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 标题栏 -->
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center space-x-4">
          <router-link to="/admin" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">客服管理</h1>
            <p class="text-gray-600 mt-1">处理用户咨询和在线客服</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ChatBubbleLeftRightIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-600">待处理咨询</p>
            <p class="text-2xl font-bold text-secondary-900">{{ pendingCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <ChatBubbleLeftRightIcon class="w-6 h-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-600">活跃会话</p>
            <p class="text-2xl font-bold text-secondary-900">{{ activeSessionsCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-600">今日处理</p>
            <p class="text-2xl font-bold text-secondary-900">{{ todayCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <UserGroupIcon class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-600">活跃用户</p>
            <p class="text-2xl font-bold text-secondary-900">{{ activeUsers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页和操作按钮 -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex space-x-1">
            <button
              @click="currentTab = 'pending'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                currentTab === 'pending' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              待处理咨询 ({{ pendingCount }})
            </button>
            <button
              @click="currentTab = 'active'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                currentTab === 'active' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              活跃会话 ({{ activeSessionsCount }})
            </button>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="cleanupTimeoutSessions"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              :disabled="cleaningUp"
            >
              {{ cleaningUp ? '清理中...' : '清理超时会话' }}
            </button>
            <button 
              @click="refreshCurrentTab"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              刷新
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center space-x-2 text-gray-500">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 待处理消息列表 -->
      <div v-if="currentTab === 'pending'">
        <div v-if="pendingMessages.length > 0" class="divide-y divide-gray-200">
          <div 
            v-for="message in pendingMessages" 
            :key="message.id"
            class="p-6 hover:bg-gray-50 cursor-pointer"
            @click="selectMessage(message)"
          >
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon class="w-6 h-6 text-primary-600" />
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-secondary-900">
                      {{ message.userName || '访客' }}
                    </p>
                    <span v-if="message.userPhone" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {{ message.userPhone }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">{{ formatTime(message.createdAt) }}</p>
                </div>
                
                <p class="mt-1 text-sm text-secondary-600 truncate">
                  {{ message.message }}
                </p>
                
                <div class="mt-2 flex items-center space-x-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    待处理
                  </span>
                  <span class="text-xs text-gray-500">
                    会话ID: {{ message.sessionId }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="p-8 text-center">
          <CheckCircleIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无待处理咨询</h3>
          <p class="text-gray-500">所有咨询都已处理完毕</p>
        </div>
      </div>

      <!-- 活跃会话列表 -->
      <div v-else-if="currentTab === 'active'">
        <div v-if="activeSessions.length > 0" class="divide-y divide-gray-200">
          <div 
            v-for="session in activeSessions" 
            :key="session.sessionId"
            class="p-6 hover:bg-gray-50"
          >
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon class="w-6 h-6 text-orange-600" />
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-secondary-900">
                      {{ session.latestMessage?.userName || '访客' }}
                    </p>
                    <span v-if="session.latestMessage?.userPhone" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {{ session.latestMessage.userPhone }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">{{ formatTime(session.lastActivity) }}</p>
                </div>
                
                <p class="mt-1 text-sm text-secondary-600 truncate">
                  {{ session.latestMessage?.message }}
                </p>
                
                <div class="mt-2 flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      活跃中
                    </span>
                    <span class="text-xs text-gray-500">
                      会话ID: {{ session.sessionId }}
                    </span>
                    <span class="text-xs text-gray-500">
                      待回复: {{ session.pendingCount }}
                    </span>
                  </div>
                  
                  <div class="flex space-x-2">
                    <button
                      @click="selectSession(session)"
                      class="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
                    >
                      回复
                    </button>
                    <button
                      @click="endSession(session.sessionId)"
                      class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      结束
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="p-8 text-center">
          <ChatBubbleLeftRightIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无活跃会话</h3>
          <p class="text-gray-500">当前没有进行中的人工对话</p>
        </div>
      </div>
    </div>

    <!-- 回复模态框 -->
    <div v-if="selectedMessage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <!-- 模态框头部 -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon class="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ selectedMessage.userName || '访客' }}
                </h3>
                <p class="text-sm text-gray-500">{{ selectedMessage.userPhone || '未留手机号' }}</p>
              </div>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- 会话历史 -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            <div 
              v-for="msg in sessionMessages" 
              :key="msg.id"
              class="flex"
              :class="msg.senderType === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div class="max-w-xs lg:max-w-md">
                <div 
                  class="px-4 py-2 rounded-2xl"
                  :class="getMessageStyle(msg)"
                >
                  <p class="text-sm whitespace-pre-wrap">{{ msg.message }}</p>
                </div>
                <div class="flex items-center space-x-2 mt-1 px-2" :class="msg.senderType === 'user' ? 'justify-end' : 'justify-start'">
                  <span class="text-xs text-gray-500">
                    {{ getSenderName(msg) }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatTime(msg.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 回复输入 -->
        <div class="px-6 py-4 border-t border-gray-200">
          <div class="flex space-x-3 mb-3">
            <textarea
              v-model="replyMessage"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="输入回复内容..."
              rows="3"
            ></textarea>
            <div class="flex flex-col space-y-2">
              <button
                @click="sendReply"
                :disabled="!replyMessage.trim() || replying"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ replying ? '发送中...' : '发送' }}
              </button>
              <button
                @click="endCurrentSession"
                :disabled="replying"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                结束会话
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-500">
            💡 提示：回复后会话将保持活跃状态，3分钟无新消息后自动结束
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const loading = ref(false)
const currentTab = ref('pending')
const pendingMessages = ref([])
const activeSessions = ref([])
const selectedMessage = ref(null)
const sessionMessages = ref([])
const replyMessage = ref('')
const replying = ref(false)
const cleaningUp = ref(false)

// 统计数据
const pendingCount = ref(0)
const activeSessionsCount = ref(0)
const todayCount = ref(0)
const activeUsers = ref(0)

// 获取待处理消息
const fetchPendingMessages = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch('/api/chat/admin/pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    if (result.success) {
      pendingMessages.value = result.data.sessions
      pendingCount.value = result.data.total
    }
  } catch (error) {
    console.error('获取待处理消息失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取活跃会话
const fetchActiveSessions = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch('/api/chat/admin/active-sessions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    if (result.success) {
      activeSessions.value = result.data.sessions
      activeSessionsCount.value = result.data.total
    }
  } catch (error) {
    console.error('获取活跃会话失败:', error)
  } finally {
    loading.value = false
  }
}

// 选择消息进行回复
const selectMessage = async (message) => {
  selectedMessage.value = message
  
  try {
    const response = await fetch(`/api/chat/history/${message.sessionId}`)
    const result = await response.json()
    
    if (result.success) {
      sessionMessages.value = result.data.messages
    }
  } catch (error) {
    console.error('获取会话历史失败:', error)
  }
}

// 选择会话进行回复
const selectSession = async (session) => {
  selectedMessage.value = {
    sessionId: session.sessionId,
    userName: session.latestMessage?.userName,
    userPhone: session.latestMessage?.userPhone
  }
  
  try {
    const response = await fetch(`/api/chat/history/${session.sessionId}`)
    const result = await response.json()
    
    if (result.success) {
      sessionMessages.value = result.data.messages
    }
  } catch (error) {
    console.error('获取会话历史失败:', error)
  }
}

// 发送回复
const sendReply = async () => {
  if (!replyMessage.value.trim() || replying.value) return
  
  replying.value = true
  
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch('/api/chat/admin/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId: selectedMessage.value.sessionId,
        message: replyMessage.value.trim()
      })
    })
    
    const result = await response.json()
    if (result.success) {
      replyMessage.value = ''
      closeModal()
      await refreshCurrentTab() // 刷新当前标签页
    } else {
      alert(result.message || '发送回复失败')
    }
  } catch (error) {
    console.error('发送回复失败:', error)
    alert('网络错误，请稍后重试')
  } finally {
    replying.value = false
  }
}

// 结束会话
const endSession = async (sessionId) => {
  if (!confirm('确定要结束这个会话吗？')) return
  
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch(`/api/chat/admin/end-session/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    if (result.success) {
      await refreshCurrentTab()
    } else {
      alert(result.message || '结束会话失败')
    }
  } catch (error) {
    console.error('结束会话失败:', error)
    alert('网络错误，请稍后重试')
  }
}

// 结束当前会话
const endCurrentSession = async () => {
  if (!selectedMessage.value?.sessionId) return
  await endSession(selectedMessage.value.sessionId)
  closeModal()
}

// 清理超时会话
const cleanupTimeoutSessions = async () => {
  if (!confirm('确定要清理所有超时会话吗？这将结束3分钟内无活动的会话。')) return
  
  cleaningUp.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch('/api/chat/admin/cleanup-timeout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    if (result.success) {
      alert(result.message)
      await refreshCurrentTab()
    } else {
      alert(result.message || '清理失败')
    }
  } catch (error) {
    console.error('清理超时会话失败:', error)
    alert('网络错误，请稍后重试')
  } finally {
    cleaningUp.value = false
  }
}

// 关闭模态框
const closeModal = () => {
  selectedMessage.value = null
  sessionMessages.value = []
  replyMessage.value = ''
}

// 刷新当前标签页
const refreshCurrentTab = async () => {
  if (currentTab.value === 'pending') {
    await fetchPendingMessages()
  } else if (currentTab.value === 'active') {
    await fetchActiveSessions()
  }
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
    return message.userName || '用户'
  } else if (message.senderType === 'ai') {
    return 'AI助手'
  } else {
    return '人工客服'
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  fetchPendingMessages()
  fetchActiveSessions()
})
</script> 