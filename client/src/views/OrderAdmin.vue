<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/admin" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </router-link>
            <h1 class="text-xl font-semibold text-gray-900">订单管理</h1>
          </div>
          <div class="flex items-center space-x-4">
            <select 
              v-model="statusFilter"
              @change="fetchOrders"
              class="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="contacted">已联系</option>
              <option value="completed">已完成</option>
            </select>
            <input 
              v-model="dateFilter"
              @change="fetchOrders"
              type="date"
              class="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Orders Table -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户名
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单详情
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  下单时间
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in orders" :key="order.id">
                <!-- 客户信息 -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ order.address }}</div>
                  <div v-if="order.orderNo" class="text-xs text-blue-600 mt-1">订单号: {{ order.orderNo }}</div>
                </td>
                
                <!-- 用户名 -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="order.user" class="text-sm font-medium text-green-600">
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {{ order.user.name }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      注册用户 ID: {{ order.user.id }}
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-500">
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      游客用户
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      未登录下单
                    </div>
                  </div>
                </td>
                
                <!-- 联系方式 -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ order.phone }}</div>
                  <div v-if="order.wechatId" class="text-sm text-gray-500">
                    微信: {{ order.wechatId }}
                  </div>
                </td>
                
                <!-- 订单详情 -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs">
                    <div v-if="order.items && Array.isArray(order.items)">
                      <div v-for="item in order.items" :key="item.productId || item.id" class="mb-2">
                        <div class="font-medium">{{ item.productName || item.name }}</div>
                        <div class="text-gray-500">
                          数量: {{ item.quantity }}
                          <span v-if="item.color"> | 颜色: {{ item.color }}</span>
                          <span v-if="item.specification"> | 规格: {{ item.specification }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-gray-500">
                      订单详情解析失败
                    </div>
                    <div v-if="order.notes" class="text-xs text-blue-600 mt-2">
                      备注: {{ order.notes }}
                    </div>
                  </div>
                  <div class="text-sm font-medium text-gray-900 mt-2">
                    总金额: ¥{{ order.totalAmount || 0 }}
                  </div>
                </td>
                
                <!-- 状态 -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <select 
                    :value="order.status || 'pending'"
                    @change="updateOrderStatus(order.id, $event.target.value)"
                    class="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    :class="getStatusClass(order.status || 'pending')"
                  >
                    <option value="pending">待处理</option>
                    <option value="measuring">测量中</option>
                    <option value="measured">已测量</option>
                    <option value="producing">生产中</option>
                    <option value="installing">安装中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </td>
                
                <!-- 下单时间 -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(order.createdAt) }}
                </td>
                
                <!-- 操作 -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    @click="generateContract(order)"
                    class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md border border-red-200"
                  >
                    生成合同
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-500">加载中...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && orders.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无订单</h3>
          <p class="mt-1 text-sm text-gray-500">还没有收到任何订单。</p>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">待处理订单</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">处理中订单</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.contacted }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">已完成订单</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.completed }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const orders = ref([])
const loading = ref(false)
const statusFilter = ref('')
const dateFilter = ref('')

// 计算统计信息
const stats = computed(() => {
  const pending = orders.value.filter(order => !order.status || order.status === 'pending').length
  const contacted = orders.value.filter(order => ['measuring', 'measured', 'producing', 'installing'].includes(order.status)).length
  const completed = orders.value.filter(order => order.status === 'completed').length
  
  return { pending, contacted, completed }
})

// 检查登录状态
const checkAuth = () => {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    router.push('/admin/login')
    return false
  }
  return true
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    let url = '/api/orders'
    
    // 添加筛选参数
    const params = new URLSearchParams()
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (dateFilter.value) params.append('date', dateFilter.value)
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      
      if (result.success) {
        orders.value = result.data || []
        
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
        console.error('获取订单失败:', result.message)
      }
    } else if (response.status === 401 || response.status === 403) {
      // Token过期或无权限，跳转到登录页
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    } else {
      console.error('获取订单失败:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

// 更新订单状态
const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
    
    if (response.ok) {
              // 更新本地数据
        const orderIndex = orders.value.findIndex(order => order.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = status
        }
    } else {
      alert('状态更新失败')
    }
  } catch (error) {
    console.error('Failed to update order status:', error)
    alert('网络错误，请稍后重试')
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'measuring':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'measured':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'producing':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'installing':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 生成合同
const generateContract = (order) => {
  // 跳转到合同管理页面，并传递订单ID
  router.push(`/admin/contracts?orderId=${order.id}`)
}

onMounted(() => {
  if (checkAuth()) {
    fetchOrders()
  }
})
</script> 