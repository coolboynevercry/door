<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">管理员登录</h1>
        <p class="text-gray-600 mt-2">宝得利门窗管理系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input 
            v-model="username"
            type="text" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="请输入用户名"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input 
            v-model="password"
            type="password" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="请输入密码"
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>

      <div class="mt-6 text-center text-sm text-gray-500">
        <p>默认账号：admin</p>
        <p>默认密码：123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('admin')
const password = ref('123456')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    if (response.ok) {
      const data = await response.json()
      // 保存token
      localStorage.setItem('admin_token', data.token)
      // 跳转到管理首页
      router.push('/admin')
    } else {
      // 处理错误响应
      try {
        const data = await response.json()
        error.value = data.message || '登录失败'
      } catch (e) {
        // 如果响应不是JSON格式（如404页面），显示通用错误
        error.value = `登录失败 (${response.status}): ${response.statusText}`
      }
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script> 