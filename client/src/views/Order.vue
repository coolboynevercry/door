<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-secondary-900 mb-8">门窗预订</h1>

    <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Order Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Contact Information -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">联系信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">姓名 *</label>
              <input v-model="orderForm.customerName" type="text" required class="input-field" placeholder="请输入您的姓名" />
            </div>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">手机号 *</label>
              <input v-model="orderForm.customerPhone" 
                     type="tel" 
                     required 
                     maxlength="11"
                     class="input-field" 
                     :class="{ 'border-red-500': phoneError }"
                     placeholder="请输入11位手机号" 
                     @input="validatePhone" />
              <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-secondary-700 mb-2">微信号</label>
            <input v-model="orderForm.wechatId" type="text" class="input-field" placeholder="请输入您的微信号（选填）" />
          </div>
        </div>

        <!-- Address Information -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">地址信息</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">城市</label>
                <input type="text" value="福清市" disabled class="input-field bg-gray-100 text-gray-600" />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">区县 *</label>
                <CustomSelect
                  v-model="orderForm.district"
                  :options="districtOptions"
                  placeholder="请选择区县"
                  searchable
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">详细地址 *</label>
              <textarea v-model="orderForm.detailAddress" 
                        required 
                        rows="3" 
                        class="input-field" 
                        placeholder="请输入详细地址，如街道名称、小区名称、门牌号等"></textarea>
            </div>
          </div>
        </div>

        <!-- Order Notes -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">订单备注</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">特殊要求</label>
              <textarea v-model="orderForm.notes" 
                        rows="3" 
                     class="input-field" 
                        placeholder="请输入特殊要求或备注信息（选填）"></textarea>
              <p class="text-sm text-secondary-600 mt-1">
                我们的专业技术人员将与您联系确认测量和安装时间
              </p>
            </div>
          </div>
        </div>
      </div>

                <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
          <h2 class="text-xl font-semibold mb-4">预订详情</h2>
          
          <!-- Order Items -->
          <div class="space-y-4 mb-6">
            <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-3 pb-4 border-b">
              <img :src="item.image" :alt="item.name" class="w-12 h-12 object-cover rounded" />
              <div class="flex-grow">
                <h4 class="font-medium text-sm">{{ item.name }}</h4>
                <p class="text-xs text-secondary-600">{{ item.specification }}</p>
                <p class="text-xs">x{{ item.quantity }}</p>
              </div>
              <p class="font-medium text-sm">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>

          <!-- Customer Info Preview -->
          <div v-if="orderForm.customerName || orderForm.customerPhone" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-secondary-700 mb-2">预订信息</h3>
            <div class="space-y-1 text-sm">
              <p v-if="orderForm.customerName" class="text-secondary-600">
                <span class="font-medium">姓名:</span> {{ orderForm.customerName }}
              </p>
              <p v-if="orderForm.customerPhone" class="text-secondary-600">
                <span class="font-medium">手机:</span> {{ orderForm.customerPhone }}
              </p>
              <p v-if="orderForm.wechatId" class="text-secondary-600">
                <span class="font-medium">微信:</span> {{ orderForm.wechatId }}
              </p>
              <p v-if="orderForm.district" class="text-secondary-600">
                <span class="font-medium">地址:</span> 福清市{{ orderForm.district }}
              </p>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-secondary-600">商品总价:</span>
              <span>¥{{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">上门测量:</span>
              <span class="text-green-600">免费</span>
            </div>
            <div class="border-t pt-3">
              <div class="flex justify-between text-lg font-semibold">
                <span>预估总价:</span>
                <span class="text-primary-600">¥{{ cartTotal.toFixed(2) }}</span>
              </div>
              <p class="text-xs text-secondary-500 mt-1">
                * 最终价格以实际测量后为准
              </p>
            </div>
          </div>

          <button @click="submitOrder" :disabled="!isFormValid" 
                  :class="['w-full py-3 px-6 rounded-lg font-medium transition-colors', isFormValid ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed']">
            {{ loading ? '提交中...' : '提交预订' }}
          </button>

          <!-- Service Promise -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="text-sm font-medium text-blue-900 mb-2">服务承诺</h3>
            <ul class="text-xs text-blue-700 space-y-1">
              <li>• 免费上门测量</li>
              <li>• 专业技术团队</li>
              <li>• 精确尺寸定制</li>
              <li>• 质量保证承诺</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6M7 13l-2-5m2 5l2 2m6-2l2 2"></path>
        </svg>
      </div>
      <h2 class="text-2xl font-semibold text-secondary-900 mb-4">
        购物车是空的
      </h2>
      <p class="text-secondary-600 mb-8">
        请先添加门窗产品到购物车，然后再进行预订
      </p>
      <router-link to="/" class="btn-primary">
        选购门窗
      </router-link>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-900 mb-2">预订提交成功！</h3>
          <p class="text-secondary-600 mb-4">
            预订编号: {{ currentOrder?.orderNo }}
          </p>
          <p class="text-sm text-secondary-500 mb-6">
            我们将在24小时内联系您确认测量和安装时间，请保持手机畅通
          </p>
          <button @click="goHome" class="btn-primary w-full">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, useOrderStore, useUserStore } from '../stores'
import CustomSelect from '../components/CustomSelect.vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const loading = ref(false)
const showSuccessModal = ref(false)

const phoneError = ref('')

const orderForm = ref({
  customerName: '',
  customerPhone: '',
  wechatId: '',
  district: '',
  detailAddress: '',
  notes: ''
})

// 福清市区县选项
const districtOptions = [
  // 街道办事处
  { value: '玉屏街道', label: '🏙️ 玉屏街道' },
  { value: '龙山街道', label: '🏙️ 龙山街道' },
  { value: '龙江街道', label: '🏙️ 龙江街道' },
  { value: '宏路街道', label: '🏙️ 宏路街道' },
  { value: '石竹街道', label: '🏙️ 石竹街道' },
  { value: '音西街道', label: '🏙️ 音西街道' },
  { value: '阳下街道', label: '🏙️ 阳下街道' },
  
  // 镇
  { value: '海口镇', label: '🏘️ 海口镇' },
  { value: '城头镇', label: '🏘️ 城头镇' },
  { value: '南岭镇', label: '🏘️ 南岭镇' },
  { value: '龙田镇', label: '🏘️ 龙田镇' },
  { value: '江镜镇', label: '🏘️ 江镜镇' },
  { value: '港头镇', label: '🏘️ 港头镇' },
  { value: '高山镇', label: '🏘️ 高山镇' },
  { value: '沙埔镇', label: '🏘️ 沙埔镇' },
  { value: '三山镇', label: '🏘️ 三山镇' },
  { value: '东瀚镇', label: '🏘️ 东瀚镇' },
  { value: '渔溪镇', label: '🏘️ 渔溪镇' },
  { value: '上迳镇', label: '🏘️ 上迳镇' },
  { value: '新厝镇', label: '🏘️ 新厝镇' },
  { value: '江阴镇', label: '🏘️ 江阴镇' },
  { value: '东张镇', label: '🏘️ 东张镇' },
  { value: '镜洋镇', label: '🏘️ 镜洋镇' },
  { value: '一都镇', label: '🏘️ 一都镇' }
]

const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.cartTotal)
const currentOrder = computed(() => orderStore.currentOrder)

const isFormValid = computed(() => {
  return orderForm.value.customerName && 
         orderForm.value.customerPhone && 
         orderForm.value.district && 
         orderForm.value.detailAddress && 
         !phoneError.value
})

const validatePhone = () => {
  const phone = orderForm.value.customerPhone
  phoneError.value = ''
  
  if (!phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的11位手机号'
  }
}

const submitOrder = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    // 准备发送到后端的订单数据
    const orderData = {
      customerName: orderForm.value.customerName,
      phone: orderForm.value.customerPhone,
      wechatId: orderForm.value.wechatId,
      address: `福清市${orderForm.value.district} ${orderForm.value.detailAddress}`,
      notes: orderForm.value.notes,
      items: cartItems.value.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        priceUnit: item.priceUnit,
        color: item.selectedColor,
        specification: item.selectedVariant,
        image: item.image
      })),
      totalAmount: cartTotal.value,
      status: 'pending'
    }
    
    // 调用后端API创建订单
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(orderData)
    })
    
    if (response.ok) {
      const result = await response.json()
      
      // 更新本地存储（用于显示成功信息）
      orderStore.currentOrder = result.data
      
      // 清空购物车
      cartStore.clearCart()
      
      // 显示成功弹窗
      showSuccessModal.value = true
    } else {
      const error = await response.json()
      alert(error.message || '订单提交失败，请稍后重试')
    }
  } catch (error) {
    console.error('订单提交失败:', error)
    alert('网络错误，请检查网络连接后重试')
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

onMounted(() => {
  // 检查用户登录状态
  userStore.checkLoginStatus()
  
  // 如果用户未登录，直接跳转到登录页面
  if (!userStore.isLoggedIn) {
    router.push({
      name: 'UserLogin',
      query: { redirect: '/order' }
    })
    return
  }
  
  // 如果用户已登录，预填充姓名和手机号
  if (userStore.user) {
    orderForm.value.customerName = userStore.user.name || ''
    orderForm.value.customerPhone = userStore.user.phone || ''
  }
})
</script> 