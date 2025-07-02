<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">宝得利门窗管理系统</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">欢迎，管理员</span>
            <button 
              @click="logout"
              class="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">管理中心</h2>
        <p class="text-gray-600">选择功能模块进行管理</p>
      </div>

      <!-- 售前服务 -->
      <div class="mb-12">
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2 flex items-center">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            售前服务
          </h3>
          <p class="text-gray-600 ml-9">产品展示、客户咨询、用户管理等售前相关功能</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 消息咨询（客服管理） -->
          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" @click="goTo('/admin/chat')">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg leading-6 font-medium text-gray-900">消息咨询</h4>
                  <p class="mt-2 text-sm text-gray-500">处理用户咨询和在线客服</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-3">
              <div class="text-sm">
                <span class="text-orange-600 font-medium">进入管理 →</span>
              </div>
            </div>
          </div>

          <!-- 商品管理 -->
          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" @click="goTo('/admin/products')">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg leading-6 font-medium text-gray-900">商品管理</h4>
                  <p class="mt-2 text-sm text-gray-500">管理门窗产品信息、价格、库存等</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-3">
              <div class="text-sm">
                <span class="text-blue-600 font-medium">进入管理 →</span>
              </div>
            </div>
          </div>

          <!-- 用户管理 -->
          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" @click="goTo('/admin/users')">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-indigo-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg leading-6 font-medium text-gray-900">用户管理</h4>
                  <p class="mt-2 text-sm text-gray-500">管理注册用户信息和订单历史</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-3">
              <div class="text-sm">
                <span class="text-indigo-600 font-medium">进入管理 →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 售后服务 -->
      <div class="mb-12">
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2 flex items-center">
            <div class="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            售后服务
          </h3>
          <p class="text-gray-600 ml-9">订单处理、合同生成、预约安排等售后相关功能</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 订单管理 -->
          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" @click="goTo('/admin/orders')">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg leading-6 font-medium text-gray-900">订单管理</h4>
                  <p class="mt-2 text-sm text-gray-500">查看客户订单、处理订单流程</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-3">
              <div class="text-sm">
                <span class="text-green-600 font-medium">进入管理 →</span>
              </div>
            </div>
          </div>

          <!-- 合同生成 -->
          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" @click="goTo('/admin/contracts')">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg leading-6 font-medium text-gray-900">合同生成</h4>
                  <p class="mt-2 text-sm text-gray-500">生成和管理客户合同文件</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-3">
              <div class="text-sm">
                <span class="text-red-600 font-medium">进入管理 →</span>
              </div>
            </div>
          </div>

          <!-- 预约管理 -->
          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" @click="goTo('/admin/appointments')">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg leading-6 font-medium text-gray-900">预约管理</h4>
                  <p class="mt-2 text-sm text-gray-500">管理客户预约时间和安排</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-3">
              <div class="text-sm">
                <span class="text-purple-600 font-medium">进入管理 →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="mt-12">
        <h3 class="text-lg font-medium text-gray-900 mb-6">系统概览</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">总商品数</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalProducts }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">总订单数</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalOrders }}</p>
              </div>
            </div>
          </div>

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
                <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingOrders }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">注册用户</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">今日预约</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.todayAppointments }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  todayAppointments: 0,
  totalUsers: 0,
  activeUsers: 0
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

// 跳转到指定页面
const goTo = (path) => {
  router.push(path)
}

// 退出登录
const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      stats.value = result.data || result
    } else if (response.status === 401 || response.status === 403) {
      // Token过期或无权限，跳转到登录页
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    } else {
      console.error('获取统计数据失败:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  if (checkAuth()) {
    fetchStats()
  }
})
</script> 