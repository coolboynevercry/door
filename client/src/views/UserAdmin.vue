<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <router-link to="/admin" class="mr-4">
              <ChevronLeftIcon class="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">用户管理</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">总用户数：{{ stats.total }}</span>
            <span class="text-sm text-green-600">活跃用户：{{ stats.active }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 搜索和筛选 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索用户姓名或手机号..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @input="debouncedSearch"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="loadUsers"
            >
              <option value="">全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">禁用</option>
              <option value="banned">封禁</option>
            </select>
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-2 text-gray-500">加载中...</p>
        </div>

        <div v-else-if="users.length === 0" class="p-8 text-center text-gray-500">
          暂无用户数据
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地址信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单统计
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最后登录
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon class="w-5 h-5 text-primary-600" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.phone }}</div>
                  <div class="text-sm text-gray-500">{{ user.wechatId || '未填写' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ user.district || '-' }}</div>
                  <div class="text-sm text-gray-500 max-w-xs truncate">{{ user.address || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.totalOrders }} 单</div>
                  <div class="text-sm text-gray-500">¥{{ user.totalAmount || '0.00' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(user.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.lastLoginAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewUser(user)"
                      class="text-primary-600 hover:text-primary-900"
                      title="查看详情"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="toggleUserStatus(user)"
                      :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      :title="user.status === 'active' ? '禁用用户' : '启用用户'"
                    >
                      <component :is="user.status === 'active' ? XMarkIcon : CheckIcon" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center text-sm text-gray-700">
              显示第 {{ (pagination.page - 1) * pagination.limit + 1 }} - 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 条，
              共 {{ pagination.total }} 条记录
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <span class="px-3 py-1 text-sm text-gray-700">
                第 {{ pagination.page }} / {{ pagination.pages }} 页
              </span>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.pages"
                class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户详情模态框 -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">用户详情</h3>
            <button @click="closeUserModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div v-if="selectedUser" class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">姓名</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">手机号</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.phone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">微信号</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.wechatId || '未填写' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">所在区域</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.district || '未填写' }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">详细地址</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.address || '未填写' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">总订单数</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.totalOrders }} 单</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">总消费金额</label>
              <p class="mt-1 text-sm text-gray-900">¥{{ selectedUser.totalAmount || '0.00' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">注册时间</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedUser.createdAt) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">最后登录</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedUser.lastLoginAt) }}</p>
            </div>
          </div>

          <!-- 用户订单列表 -->
          <div v-if="selectedUser.orders && selectedUser.orders.length > 0" class="mt-6">
            <h4 class="text-md font-medium text-gray-900 mb-3">最近订单</h4>
            <div class="space-y-2">
              <div v-for="order in selectedUser.orders.slice(0, 5)" :key="order.id" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.orderNo }}</div>
                  <div class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">¥{{ order.totalAmount }}</div>
                  <span :class="getOrderStatusClass(order.status)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChevronLeftIcon, 
  UserIcon, 
  EyeIcon, 
  XMarkIcon, 
  CheckIcon 
} from '@heroicons/vue/24/outline'

const router = useRouter()

// 响应式数据
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showUserModal = ref(false)
const selectedUser = ref(null)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

const stats = computed(() => ({
  total: pagination.value.total,
  active: users.value.filter(u => u.status === 'active').length
}))

// 防抖搜索
const debounceTimer = ref(null)
const debouncedSearch = () => {
  clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => {
    pagination.value.page = 1
    loadUsers()
  }, 300)
}

// 获取管理员token
const getAdminToken = () => {
  return localStorage.getItem('admin_token')
}

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const token = getAdminToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value,
      status: statusFilter.value
    })

    const response = await fetch(`/api/admin/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    
    if (data.success) {
      users.value = data.data.users
      pagination.value = data.data.pagination
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    alert('加载用户列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  pagination.value.page = 1
  loadUsers()
}

// 分页
const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    loadUsers()
  }
}

// 查看用户详情
const viewUser = async (user) => {
  try {
    const token = getAdminToken()
    const response = await fetch(`/api/admin/users/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    
    if (data.success) {
      selectedUser.value = data.data
      showUserModal.value = true
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    alert('获取用户详情失败: ' + error.message)
  }
}

// 关闭用户详情模态框
const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  if (!confirm(`确定要${action}用户 ${user.name} 吗？`)) {
    return
  }

  try {
    const token = getAdminToken()
    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })

    const data = await response.json()
    
    if (data.success) {
      user.status = newStatus
      alert(`用户${action}成功`)
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('更新用户状态失败:', error)
    alert('更新用户状态失败: ' + error.message)
  }
}

// 工具函数
const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    banned: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    active: '正常',
    inactive: '禁用',
    banned: '封禁'
  }
  return texts[status] || '未知'
}

const getOrderStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getOrderStatusText = (status) => {
  const texts = {
    pending: '待联系',
    contacted: '已联系',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 页面加载时获取数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 