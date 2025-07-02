<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
          <ChevronLeftIcon class="w-5 h-5 mr-1" />
          返回
        </button>
      </div>

      <!-- 注册表单 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlusIcon class="w-8 h-8 text-primary-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">用户注册</h1>
          <p class="text-gray-600 mt-2">创建您的宝得利门窗账户</p>
        </div>

        <!-- 进度指示器 -->
        <div class="mb-8">
          <div class="flex items-center justify-center space-x-4">
            <div class="flex items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              ]">
                1
              </div>
              <span class="ml-2 text-sm text-gray-600">基本信息</span>
            </div>
            <div class="w-8 h-px bg-gray-300"></div>
            <div class="flex items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              ]">
                2
              </div>
              <span class="ml-2 text-sm text-gray-600">验证手机</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 第一步：基本信息 -->
          <div v-show="currentStep === 1">
            <!-- 姓名 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
              <input 
                v-model="registerForm.name"
                type="text" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="请输入您的真实姓名"
              />
            </div>

            <!-- 手机号 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">手机号 *</label>
              <div class="relative">
                <input 
                  v-model="registerForm.phone"
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

            <!-- 设置密码 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">设置密码 *</label>
              <div class="relative">
                <input 
                  v-model="registerForm.password"
                  :type="passwordVisible ? 'text' : 'password'"
                  required
                  minlength="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pl-12 pr-12"
                  placeholder="请输入6位以上密码"
                  @input="validatePassword"
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
              <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
            </div>

            <!-- 确认密码 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">确认密码 *</label>
              <div class="relative">
                <input 
                  v-model="registerForm.confirmPassword"
                  :type="confirmPasswordVisible ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pl-12 pr-12"
                  placeholder="请再次输入密码"
                  @input="validateConfirmPassword"
                />
                <LockClosedIcon class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  @click="confirmPasswordVisible = !confirmPasswordVisible"
                  class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="!confirmPasswordVisible" class="w-5 h-5" />
                  <EyeSlashIcon v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="confirmPasswordError" class="text-red-500 text-sm mt-1">{{ confirmPasswordError }}</p>
            </div>

            <!-- 微信号 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">微信号</label>
              <input 
                v-model="registerForm.wechatId"
                type="text" 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="请输入微信号（可选）"
              />
            </div>

            <!-- 地址信息 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">所在区域</label>
              <select 
                v-model="registerForm.district"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择所在区域（可选）</option>
                <option v-for="option in districtOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
              <textarea 
                v-model="registerForm.address"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="请输入详细地址（可选）"
              ></textarea>
            </div>
          </div>

          <!-- 第二步：验证手机号 -->
          <div v-show="currentStep === 2">
            <div class="text-center mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">验证手机号</h3>
              <p class="text-sm text-gray-600">
                验证码已发送至 <span class="font-medium text-primary-600">{{ registerForm.phone }}</span>
              </p>
            </div>

            <!-- 验证码输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">验证码 *</label>
              <div class="flex space-x-3">
                <input 
                  v-model="registerForm.verificationCode"
                  type="text" 
                  maxlength="6"
                  required
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="请输入6位验证码"
                />
                <button 
                  type="button"
                  @click="resendVerificationCode"
                  :disabled="countdown > 0"
                  class="px-4 py-3 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <span v-if="countdown > 0">{{ countdown }}s</span>
                  <span v-else>重新发送</span>
                </button>
              </div>
            </div>

            <!-- 返回修改信息 -->
            <div class="mt-4">
              <button 
                type="button"
                @click="currentStep = 1"
                class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                返回修改信息
              </button>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button 
            type="submit"
            :disabled="loading || !isCurrentStepValid"
            class="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="loading">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ currentStep === 1 ? '发送验证码...' : '注册中...' }}
            </span>
            <span v-else>
              {{ currentStep === 1 ? '发送验证码' : '完成注册' }}
            </span>
          </button>
        </form>

        <!-- 登录链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            已有账户？
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              立即登录
            </router-link>
          </p>
        </div>

        <!-- 注册说明 -->
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            注册即表示您同意我们的
            <a href="#" class="text-primary-600 hover:text-primary-700">服务条款</a>
            和
            <a href="#" class="text-primary-600 hover:text-primary-700">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronLeftIcon, UserPlusIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useUserStore } from '../stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const currentStep = ref(1)
const countdown = ref(0)
const phoneError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

const registerForm = ref({
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
  wechatId: '',
  district: '',
  address: '',
  verificationCode: ''
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

let countdownTimer = null

const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return registerForm.value.name && 
           registerForm.value.phone && 
           registerForm.value.password && 
           registerForm.value.confirmPassword &&
           !phoneError.value && 
           !passwordError.value && 
           !confirmPasswordError.value
  } else if (currentStep.value === 2) {
    return registerForm.value.verificationCode
  }
  return false
})

const validatePhone = () => {
  const phone = registerForm.value.phone
  phoneError.value = ''
  
  if (!phone) {
    phoneError.value = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的11位手机号'
  }
}

const validatePassword = () => {
  const password = registerForm.value.password
  passwordError.value = ''
  
  if (!password) {
    passwordError.value = '请输入密码'
  } else if (password.length < 6) {
    passwordError.value = '密码长度至少6位'
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    passwordError.value = '密码至少包含一个字母和一个数字'
  }
  
  // 如果确认密码已填写，也重新验证确认密码
  if (registerForm.value.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  const password = registerForm.value.password
  const confirmPassword = registerForm.value.confirmPassword
  confirmPasswordError.value = ''
  
  if (!confirmPassword) {
    confirmPasswordError.value = '请确认密码'
  } else if (password !== confirmPassword) {
    confirmPasswordError.value = '两次输入的密码不一致'
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
  loading.value = true
  
  try {
    // 模拟发送验证码（实际项目中应该调用后端API）
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    currentStep.value = 2
    startCountdown()
    
    // 在开发环境下显示验证码
    if (import.meta.env.DEV) {
      alert('验证码: 123456 (开发环境)')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert('发送验证码失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const resendVerificationCode = async () => {
  if (countdown.value > 0) return
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    startCountdown()
    
    if (import.meta.env.DEV) {
      alert('验证码: 123456 (开发环境)')
    }
  } catch (error) {
    console.error('重发验证码失败:', error)
    alert('重发验证码失败，请稍后重试')
  }
}

const completeRegister = async () => {
  loading.value = true
  
  try {
    // 调用后端注册API
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      phone: registerForm.value.phone,
        password: registerForm.value.password,
      name: registerForm.value.name,
      wechatId: registerForm.value.wechatId,
      district: registerForm.value.district,
      address: registerForm.value.address,
        verificationCode: registerForm.value.verificationCode
      })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '注册失败')
    }
    
    // 保存用户信息到store
    await userStore.setUserInfo(result.data.user, result.data.token)
    
    // 显示成功提示
    alert('注册成功！欢迎加入宝得利门窗！')
    
    // 跳转到原来的页面或首页
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
    
  } catch (error) {
    console.error('注册失败:', error)
    alert(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!isCurrentStepValid.value) return
  
  if (currentStep.value === 1) {
    // 第一步：发送验证码
    await sendVerificationCode()
  } else if (currentStep.value === 2) {
    // 第二步：完成注册
    await completeRegister()
  }
}

const goBack = () => {
  const redirectTo = route.query.redirect || '/'
  router.push(redirectTo)
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

/* 表单过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style> 