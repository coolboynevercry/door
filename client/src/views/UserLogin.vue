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

        <!-- 登录方式切换 -->
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              @click="loginType = 'password'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                loginType === 'password' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              密码登录
            </button>
            <button
              @click="loginType = 'code'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                loginType === 'code' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              验证码登录
            </button>
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

          <!-- 密码登录 -->
          <div v-if="loginType === 'password'">
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

          <!-- 验证码登录 -->
          <div v-if="loginType === 'code'">
          <!-- 验证码输入 -->
          <div v-if="showVerificationCode">
            <label class="block text-sm font-medium text-gray-700 mb-2">验证码</label>
            <div class="flex space-x-3">
              <input 
                v-model="userForm.verificationCode"
                type="text" 
                maxlength="6"
                required
                class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="请输入验证码"
              />
              <button 
                type="button"
                @click="sendVerificationCode"
                :disabled="sendingCode || countdown > 0"
                class="px-4 py-3 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <span v-if="sendingCode">发送中...</span>
                <span v-else-if="countdown > 0">{{ countdown }}s</span>
                <span v-else>{{ codeSent ? '重新发送' : '获取验证码' }}</span>
              </button>
            </div>
          </div>

          <!-- 姓名输入 -->
          <div v-if="showVerificationCode">
            <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input 
              v-model="userForm.name"
              type="text" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="请输入您的姓名"
            />
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
              {{ getLoadingText() }}
            </span>
            <span v-else>
              {{ getButtonText() }}
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
const sendingCode = ref(false)
const codeSent = ref(false)
const showVerificationCode = ref(false)
const countdown = ref(0)
const phoneError = ref('')
const loginType = ref('password') // password 或 code
const passwordVisible = ref(false)

const userForm = ref({
  phone: '',
  password: '',
  verificationCode: '',
  name: ''
})

let countdownTimer = null

const isFormValid = computed(() => {
  const baseValid = userForm.value.phone && !phoneError.value
  
  if (loginType.value === 'password') {
    return baseValid && userForm.value.password
  } else {
  if (!showVerificationCode.value) {
      return baseValid
    }
    return baseValid && userForm.value.verificationCode && userForm.value.name
  }
})

const getButtonText = () => {
  if (loginType.value === 'password') {
    return '登录'
  } else {
    return showVerificationCode.value ? '登录' : '获取验证码'
  }
}

const getLoadingText = () => {
  if (loginType.value === 'password') {
    return '登录中...'
  } else {
    return showVerificationCode.value ? '登录中...' : '获取验证码...'
  }
}

const validatePhone = () => {
  const phone = userForm.value.phone
  phoneError.value = ''
  
  if (!phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的11位手机号'
  }
}

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

const sendVerificationCode = async () => {
  if (!userForm.value.phone || phoneError.value) return
  
  sendingCode.value = true
  
  try {
    // 调用后端发送验证码API
    const response = await fetch('/api/users/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: userForm.value.phone
      })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '发送验证码失败')
    }
    
    codeSent.value = true
    showVerificationCode.value = true
    startCountdown()
    
    // 在开发环境下显示验证码
    if (import.meta.env.DEV) {
      alert('验证码: 123456 (开发环境)')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert(error.message || '发送验证码失败，请稍后重试')
  } finally {
    sendingCode.value = false
  }
}

const handleLogin = async () => {
  if (!isFormValid.value) return
  
  if (loginType.value === 'code' && !showVerificationCode.value) {
    // 验证码登录第一步：获取验证码
    await sendVerificationCode()
    return
  }
  
  // 执行登录
  loading.value = true
  
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: userForm.value.phone,
        password: loginType.value === 'password' ? userForm.value.password : undefined,
        name: loginType.value === 'code' ? userForm.value.name : undefined,
        verificationCode: loginType.value === 'code' ? userForm.value.verificationCode : undefined,
        loginType: loginType.value
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

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
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