<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
          <ChevronLeftIcon class="w-5 h-5 mr-1" />
          返回
        </button>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon class="w-8 h-8 text-primary-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">用户登录</h1>
          <p class="text-gray-600 mt-2">欢迎回到宝得利门窗</p>
        </div>

        <!-- 登录说明 -->
        <div class="mb-6 text-center">
          <div class="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span class="text-sm text-blue-800">使用手机号和密码登录</span>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 手机号输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <div class="relative">
              <input 
                v-model="userForm.phone"
                type="tel" 
                maxlength="11"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pl-12"
                placeholder="请输入11位手机号"
                @input="validatePhone"
              />
              <PhoneIcon class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
          </div>

          <!-- 密码输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <input 
                v-model="userForm.password"
                :type="passwordVisible ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pl-12 pr-12"
                placeholder="请输入密码"
              />
              <LockClosedIcon class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <button
                type="button"
                @click="passwordVisible = !passwordVisible"
                class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!passwordVisible" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- 登录按钮 -->
          <button 
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="loading">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
            <span v-else>
              立即登录
            </span>
          </button>
        </form>

        <!-- 注册链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            还没有账户？
            <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              立即注册
            </router-link>
          </p>
        </div>

        <!-- 登录说明 -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronLeftIcon, UserIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useUserStore } from '../stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const phoneError = ref('')
const passwordVisible = ref(false)

const userForm = ref({
  phone: '',
  password: ''
})

const isFormValid = computed(() => {
  return userForm.value.phone && 
         userForm.value.password && 
         !phoneError.value
})

const validatePhone = () => {
  const phone = userForm.value.phone
  phoneError.value = ''
  
  if (!phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的11位手机号'
  }
}

const handleLogin = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    const response = await fetch('/.netlify/functions/users-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: userForm.value.phone,
        password: userForm.value.password
      })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '登录失败')
    }
    
    // 保存用户信息到store
    await userStore.setUserInfo(result.data.user, result.data.token)
    
    // 跳转到原来的页面或首页
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
    
  } catch (error) {
    console.error('登录失败:', error)
    alert(error.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  // 如果是从订单页面重定向过来的，返回购物车页面
  // 否则返回首页
  if (route.query.redirect === '/order') {
    router.push('/cart')
  } else {
    router.push('/')
  }
}


</script>

<style scoped>
/* 自定义样式 */
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