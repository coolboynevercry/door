<template>
  <div class="space-y-4">
    <!-- 当前图片预览 -->
    <div v-if="currentImage" class="relative">
      <div class="w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        <img :src="getImageUrl(currentImage)" alt="商品图片" class="w-full h-full object-cover" 
             @error="handleImageError" />
      </div>
      <button 
        @click="removeImage"
        type="button"
        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- 上传区域 -->
    <div v-if="!currentImage" class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        
        <div class="mt-4">
          <label for="file-upload" class="cursor-pointer">
            <span class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              选择图片
            </span>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              accept="image/*"
              class="sr-only" 
              @change="handleFileSelect"
              ref="fileInput"
            />
          </label>
        </div>
        
        <p class="mt-2 text-sm text-gray-500">或拖拽图片到此区域</p>
        <p class="text-xs text-gray-400">支持 PNG, JPG, JPEG, WEBP 格式，最大5MB</p>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2">
      <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="`width: ${uploadProgress}%`"></div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <!-- URL输入备选方案 -->
    <div class="border-t pt-4">
      <details class="group">
        <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          或者输入图片URL
        </summary>
        <div class="mt-2">
          <input 
            v-model="urlInput"
            type="url" 
            placeholder="https://example.com/image.jpg"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @blur="handleUrlInput"
          />
          <button 
            @click="useUrlImage"
            type="button"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            使用此URL
          </button>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const currentImage = ref(props.modelValue)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const urlInput = ref('')
const fileInput = ref(null)

// 监听外部变化
watch(() => props.modelValue, (newValue) => {
  currentImage.value = newValue
})

// 监听内部变化并向外发送
watch(currentImage, (newValue) => {
  emit('update:modelValue', newValue)
})

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file)
  }
}

// 上传文件
const uploadFile = async (file) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }

  // 验证文件大小
  if (file.size > 5 * 1024 * 1024) {
    error.value = '文件大小不能超过5MB'
    return
  }

  error.value = ''
  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('image', file)

    const token = localStorage.getItem('admin_token')
    
    // 创建XMLHttpRequest以支持进度监控
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    })

    // 处理响应
    xhr.onload = function() {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText)
        if (result.success) {
          currentImage.value = result.data.url
          uploadProgress.value = 100
        } else {
          error.value = result.message || '上传失败'
        }
      } else {
        error.value = '上传失败'
      }
      uploading.value = false
    }

    xhr.onerror = function() {
      error.value = '网络错误，上传失败'
      uploading.value = false
    }

    // 发送请求
    xhr.open('POST', '/api/upload/image')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(formData)

  } catch (err) {
    console.error('Upload error:', err)
    error.value = '上传失败'
    uploading.value = false
  }
}

// 移除图片
const removeImage = () => {
  currentImage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 处理URL输入
const handleUrlInput = () => {
  if (urlInput.value) {
    useUrlImage()
  }
}

// 使用URL图片
const useUrlImage = () => {
  if (urlInput.value) {
    currentImage.value = urlInput.value
    urlInput.value = ''
  }
}

// 获取图片URL - 处理相对路径和绝对路径
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return ''
  
  // 如果是完整的URL（http/https），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // 如果是相对路径，尝试不同的访问方式
  if (imageUrl.startsWith('/uploads/')) {
    // 首先尝试通过前端代理访问
    return imageUrl
  }
  
  // 其他情况直接返回
  return imageUrl
}

// 处理图片加载错误
const handleImageError = (event) => {
  console.log('图片加载失败，尝试直接访问后端:', currentImage.value)
  
  // 如果通过代理失败，尝试直接访问后端
  if (currentImage.value && currentImage.value.startsWith('/uploads/')) {
    const directUrl = `http://localhost:3000${currentImage.value}`
    event.target.src = directUrl
    console.log('切换到直接访问:', directUrl)
  }
}
</script> 