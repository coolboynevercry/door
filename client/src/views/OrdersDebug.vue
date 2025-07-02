<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">订单系统调试页面</h1>
      
      <!-- 用户状态 -->
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">用户登录状态</h2>
        <div class="space-y-2">
          <p><strong>是否登录:</strong> {{ userStore.isLoggedIn ? '✅ 是' : '❌ 否' }}</p>
          <p><strong>用户信息:</strong> {{ userStore.user || '无' }}</p>
          <p><strong>令牌:</strong> {{ userStore.token ? '有令牌' : '无令牌' }}</p>
        </div>
        <div class="mt-4 space-x-4">
          <button @click="checkLoginStatus" class="bg-blue-500 text-white px-4 py-2 rounded">
            检查登录状态
          </button>
          <button @click="goToLogin" class="bg-green-500 text-white px-4 py-2 rounded">
            去登录
          </button>
        </div>
      </div>

      <!-- API 测试 -->
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">API 测试</h2>
        <div class="space-x-4 mb-4">
          <button @click="testUserOrdersAPI" class="bg-purple-500 text-white px-4 py-2 rounded">
            测试用户订单API
          </button>
          <button @click="testCreateOrder" class="bg-orange-500 text-white px-4 py-2 rounded">
            测试创建订单
          </button>
        </div>
        <div v-if="apiResult" class="mt-4 p-4 bg-gray-100 rounded">
          <h3 class="font-semibold mb-2">API 结果:</h3>
          <pre class="text-sm overflow-auto">{{ JSON.stringify(apiResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 订单数据 -->
      <div class="bg-white rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">订单数据 ({{ orders.length }} 条)</h2>
        <div v-if="orders.length === 0" class="text-gray-500">
          暂无订单数据
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="border border-gray-200 rounded p-4"
          >
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><strong>订单ID:</strong> {{ order.id }}</div>
              <div><strong>订单号:</strong> {{ order.orderNo }}</div>
              <div><strong>客户名:</strong> {{ order.customerName }}</div>
              <div><strong>电话:</strong> {{ order.phone }}</div>
              <div><strong>状态:</strong> {{ order.status }}</div>
              <div><strong>金额:</strong> ¥{{ order.totalAmount }}</div>
              <div><strong>创建时间:</strong> {{ order.createdAt }}</div>
              <div><strong>商品数量:</strong> {{ order.items ? order.items.length : '无' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores'

const router = useRouter()
const userStore = useUserStore()

const orders = ref([])
const apiResult = ref(null)

const checkLoginStatus = () => {
  const status = userStore.checkLoginStatus()
  console.log('登录状态检查结果:', status)
  alert(`登录状态: ${status ? '已登录' : '未登录'}`)
}

const goToLogin = () => {
  router.push('/login?redirect=' + encodeURIComponent('/orders-debug'))
}

const testUserOrdersAPI = async () => {
  if (!userStore.token) {
    alert('无用户令牌，请先登录')
    return
  }

  try {
    const response = await fetch('/api/users/orders', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    apiResult.value = result
    
    if (result.success && result.data && result.data.orders) {
      orders.value = result.data.orders
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
    }

    console.log('API 测试结果:', result)
  } catch (error) {
    console.error('API 测试失败:', error)
    apiResult.value = { error: error.message }
  }
}

const testCreateOrder = async () => {
  if (!userStore.token) {
    alert('无用户令牌，请先登录')
    return
  }

  try {
    const orderData = {
      customerName: userStore.user?.name || '测试用户',
      phone: userStore.user?.phone || '13800000000',
      address: '测试地址123号',
      items: [
        {
          productId: 999,
          productName: '调试测试产品',
          quantity: 1,
          price: 100,
          priceUnit: '个'
        }
      ],
      totalAmount: 100,
      notes: '这是调试页面创建的测试订单'
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()
    apiResult.value = result
    
    if (result.success) {
      alert('订单创建成功！')
      await testUserOrdersAPI() // 重新加载订单
    } else {
      alert('订单创建失败: ' + result.message)
    }

    console.log('创建订单结果:', result)
  } catch (error) {
    console.error('创建订单失败:', error)
    apiResult.value = { error: error.message }
  }
}

onMounted(() => {
  console.log('调试页面加载完成')
  console.log('当前用户状态:', {
    isLoggedIn: userStore.isLoggedIn,
    user: userStore.user,
    hasToken: !!userStore.token
  })
})
</script> 