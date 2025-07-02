<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">订单服务中心</h1>
          <div class="flex space-x-4">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- 订单列表标签页 -->
      <div v-if="activeTab === 'orders'" class="space-y-6">
        <!-- 筛选器 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">订单状态</label>
              <select v-model="filters.status" class="input-field">
                <option value="">全部状态</option>
                <option value="pending">待处理</option>
                <option value="measuring">测量中</option>
                <option value="measured">已测量</option>
                <option value="producing">生产中</option>
                <option value="installing">安装中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="loadOrders" class="btn-primary">筛选</button>
            </div>
          </div>
        </div>

        <!-- 订单列表 -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
          <p class="text-gray-600 mb-4">您还没有任何订单</p>
          <router-link to="/" class="btn-primary">去购买</router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <!-- 订单头部 -->
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                  <h3 class="font-medium text-gray-900">订单号: {{ order.orderNo }}</h3>
                  <span
                    :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(order.status)]"
                  >
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatDate(order.createdAt) }}
                </div>
              </div>
            </div>

            <!-- 订单内容 -->
            <div class="px-6 py-4">
              <!-- 订单基本信息 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">联系信息</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p>联系人：{{ order.customerName }}</p>
                    <p>电话：{{ order.phone }}</p>
                    <p>地址：{{ order.address }}</p>
                  </div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">订单金额</h4>
                  <div class="text-lg font-semibold text-primary-600">
                    ¥{{ order.totalAmount }}
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-3 pt-4 border-t border-gray-200">
                <button @click="viewOrderTracking(order)" class="btn-secondary text-sm">
                  订单追踪
                </button>
                <button
                  @click="requestAfterSales(order)"
                  class="btn-secondary text-sm"
                  v-if="order.status === 'completed'"
                >
                  申请售后
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单追踪标签页 -->
      <div v-if="activeTab === 'tracking'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">选择要追踪的订单</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="order in trackableOrders"
              :key="order.id"
              @click="selectTrackingOrder(order)"
              class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium">{{ order.orderNo }}</span>
                <span
                  :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(order.status)]"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">{{ order.customerName }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- 订单追踪详情 -->
        <div v-if="selectedTrackingOrder" class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-6">订单追踪 - {{ selectedTrackingOrder.orderNo }}</h2>
          
          <!-- 追踪进度 -->
          <div class="space-y-6">
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium">订单已创建</h3>
                <p class="text-sm text-gray-600">{{ formatDate(selectedTrackingOrder.createdAt) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                selectedTrackingOrder.measurementScheduled ? 'bg-green-500' : 'bg-gray-300'
              ]">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium">测量预约</h3>
                <p class="text-sm text-gray-600">
                  {{ selectedTrackingOrder.measurementScheduled 
                      ? formatDate(selectedTrackingOrder.measurementScheduled)
                      : '待预约' }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                selectedTrackingOrder.measurementCompleted ? 'bg-green-500' : 'bg-gray-300'
              ]">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium">测量完成</h3>
                <p class="text-sm text-gray-600">
                  {{ selectedTrackingOrder.measurementCompleted 
                      ? formatDate(selectedTrackingOrder.measurementCompleted)
                      : '待完成' }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                selectedTrackingOrder.installationScheduled ? 'bg-green-500' : 'bg-gray-300'
              ]">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium">安装预约</h3>
                <p class="text-sm text-gray-600">
                  {{ selectedTrackingOrder.installationScheduled 
                      ? formatDate(selectedTrackingOrder.installationScheduled)
                      : '待预约' }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                selectedTrackingOrder.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              ]">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium">安装完成</h3>
                <p class="text-sm text-gray-600">
                  {{ selectedTrackingOrder.status === 'completed' && selectedTrackingOrder.installationCompleted
                      ? formatDate(selectedTrackingOrder.installationCompleted)
                      : '待完成' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单售后标签页 -->
      <div v-if="activeTab === 'aftersales'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">售后服务</h2>
          
          <div v-if="!showAfterSalesForm" class="text-center py-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75A9.75 9.75 0 0112 2.25z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">售后服务支持</h3>
            <p class="text-gray-600 mb-6">我们提供专业的售后服务，包括产品维修、更换、咨询等</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="text-center">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 class="font-medium">质量保证</h4>
                <p class="text-sm text-gray-600">产品质量问题免费维修</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 class="font-medium">快速响应</h4>
                <p class="text-sm text-gray-600">24小时内响应服务请求</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2v-1M15 10V6a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h1m8 0h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2V4"></path>
                  </svg>
                </div>
                <h4 class="font-medium">专业咨询</h4>
                <p class="text-sm text-gray-600">专业技术人员在线咨询</p>
              </div>
            </div>

            <button @click="showAfterSalesForm = true" class="btn-primary">
              申请售后服务
            </button>
          </div>

          <!-- 售后申请表单 -->
          <div v-if="showAfterSalesForm" class="max-w-2xl mx-auto">
            <h3 class="text-lg font-medium mb-6">申请售后服务</h3>
            
            <form @submit.prevent="submitAfterSales" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">选择订单</label>
                <select v-model="afterSalesForm.orderId" required class="input-field">
                  <option value="">请选择订单</option>
                  <option
                    v-for="order in completedOrders"
                    :key="order.id"
                    :value="order.id"
                  >
                    {{ order.orderNo }} - {{ order.customerName }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">服务类型</label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    v-for="type in afterSalesTypes"
                    :key="type.value"
                    class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                    :class="afterSalesForm.serviceType === type.value ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'"
                  >
                    <input
                      v-model="afterSalesForm.serviceType"
                      type="radio"
                      :value="type.value"
                      class="sr-only"
                    />
                    <div class="flex flex-1">
                      <div class="flex flex-col">
                        <span class="block text-sm font-medium text-gray-900">{{ type.label }}</span>
                        <span class="mt-1 flex items-center text-sm text-gray-500">{{ type.description }}</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
                <textarea
                  v-model="afterSalesForm.description"
                  rows="4"
                  required
                  class="input-field"
                  placeholder="请详细描述遇到的问题，以便我们更好地为您服务"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">联系人</label>
                  <input
                    v-model="afterSalesForm.contactName"
                    type="text"
                    required
                    class="input-field"
                    placeholder="请输入联系人姓名"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
                  <input
                    v-model="afterSalesForm.contactPhone"
                    type="tel"
                    required
                    class="input-field"
                    placeholder="请输入联系电话"
                  />
                </div>
              </div>

              <div class="flex space-x-4">
                <button type="submit" :disabled="afterSalesLoading" class="btn-primary">
                  {{ afterSalesLoading ? '提交中...' : '提交申请' }}
                </button>
                <button
                  type="button"
                  @click="showAfterSalesForm = false"
                  class="btn-secondary"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('orders')
const loading = ref(false)
const afterSalesLoading = ref(false)
const orders = ref([])
const selectedTrackingOrder = ref(null)
const showAfterSalesForm = ref(false)

const filters = ref({
  status: ''
})

const afterSalesForm = ref({
  orderId: '',
  serviceType: '',
  description: '',
  contactName: '',
  contactPhone: ''
})

// 标签页配置
const tabs = [
  { key: 'orders', label: '我的订单' },
  { key: 'tracking', label: '订单追踪' },
  { key: 'aftersales', label: '订单售后' }
]

// 售后服务类型
const afterSalesTypes = [
  { value: 'repair', label: '维修服务', description: '产品损坏需要维修' },
  { value: 'replace', label: '更换服务', description: '产品质量问题需要更换' },
  { value: 'consultation', label: '咨询服务', description: '使用问题咨询' }
]

// 计算属性
const trackableOrders = computed(() => {
  return orders.value.filter(order => 
    order.status !== 'cancelled' && order.status !== 'pending'
  )
})

const completedOrders = computed(() => {
  return orders.value.filter(order => order.status === 'completed')
})

// 方法
const loadOrders = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.status) params.append('status', filters.value.status)

    const response = await fetch(`/api/users/orders?${params}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log('订单数据:', result) // 调试信息
      
      if (result.success) {
        // API返回的数据格式是 {data: {orders: [...], pagination: {...}}}
        orders.value = result.data.orders || []
        
        // 解析JSON字符串格式的items
        orders.value.forEach(order => {
          if (typeof order.items === 'string') {
            try {
              order.items = JSON.parse(order.items)
            } catch (e) {
              console.error('解析订单商品失败:', e)
              order.items = []
            }
          }
        })
      } else {
        console.error('API请求失败:', result.message)
        orders.value = []
      }
    } else {
      console.error('HTTP请求失败:', response.status, response.statusText)
      if (response.status === 401) {
        // 令牌过期，重新登录
        userStore.logout()
        router.push('/login')
      } else {
        orders.value = []
      }
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const viewOrderTracking = (order) => {
  console.log('查看订单追踪:', order)
  activeTab.value = 'tracking'
  selectedTrackingOrder.value = order
}

const selectTrackingOrder = (order) => {
  console.log('选择追踪订单:', order)
  selectedTrackingOrder.value = order
}

const requestAfterSales = (order) => {
  activeTab.value = 'aftersales'
  showAfterSalesForm.value = true
  afterSalesForm.value.orderId = order.id
  afterSalesForm.value.contactName = order.customerName
  afterSalesForm.value.contactPhone = order.phone
}

const submitAfterSales = async () => {
  afterSalesLoading.value = true
  try {
    // 模拟提交售后申请
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('售后申请提交成功，我们将在24小时内联系您')
    showAfterSalesForm.value = false
    afterSalesForm.value = {
      orderId: '',
      serviceType: '',
      description: '',
      contactName: '',
      contactPhone: ''
    }
  } catch (error) {
    console.error('Error submitting after sales:', error)
    alert('网络错误，请稍后重试')
  } finally {
    afterSalesLoading.value = false
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'measuring': '测量中',
    'measured': '已测量',
    'producing': '生产中',
    'installing': '安装中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'measuring': 'bg-blue-100 text-blue-800',
    'measured': 'bg-indigo-100 text-indigo-800',
    'producing': 'bg-purple-100 text-purple-800',
    'installing': 'bg-orange-100 text-orange-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  // 检查登录状态
  const isLoggedIn = userStore.checkLoginStatus()
  if (!isLoggedIn) {
    console.log('用户未登录，跳转到登录页')
    router.push('/login?redirect=' + encodeURIComponent('/orders'))
    return
  }
  
  console.log('用户已登录，当前用户:', userStore.user)
  console.log('用户令牌:', userStore.token)
  
  // 加载订单
  await loadOrders()
  
  // 预填用户信息
  if (userStore.user) {
    afterSalesForm.value.contactName = userStore.user.name || ''
    afterSalesForm.value.contactPhone = userStore.user.phone || ''
  }
})
</script> 