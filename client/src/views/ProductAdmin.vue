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
            <h1 class="text-xl font-semibold text-gray-900">商品管理</h1>
          </div>
          <button 
            @click="showAddDialog = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            添加商品
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Products Table -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品信息
                </th>
                <th class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  尺寸
                </th>
                <th class="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-16 w-16 relative">
                      <img 
                        v-if="product.image" 
                        class="h-16 w-16 rounded-lg object-cover border border-gray-200" 
                        :src="getImageUrl(product.image)" 
                        :alt="product.name"
                        @error="handleImageError($event, product.image, product.id)"
                        :data-product-id="product.id"
                      >
                      <div 
                        class="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                        v-show="!product.image"
                        :data-placeholder="product.id"
                      >
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4 min-w-0 flex-1">
                      <div class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</div>
                      <div class="text-xs text-gray-500 line-clamp-2">
                        {{ product.description && product.description.length > 50 
                           ? product.description.substring(0, 50) + '...' 
                           : product.description || '暂无描述' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ product.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{{ product.price }} / {{ product.priceUnit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="product.specifications && product.specifications.length">
                    <span v-for="(spec, index) in product.specifications.slice(0, 2)" :key="spec">
                      {{ spec }}{{ index < product.specifications.slice(0, 2).length - 1 ? ', ' : '' }}
                    </span>
                    <span v-if="product.specifications.length > 2" class="text-gray-400">...</span>
                  </div>
                  <span v-else>-</span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editProduct(product)"
                      class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                      title="编辑商品"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      编辑
                    </button>
                    <button 
                      @click="confirmDelete(product)"
                      class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      title="删除商品"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      删除
                    </button>
                  </div>
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
        <div v-if="!loading && products.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无商品</h3>
          <p class="mt-1 text-sm text-gray-500">开始添加您的第一个商品吧！</p>
        </div>
      </div>
    </main>

    <!-- Add/Edit Product Dialog -->
    <div v-if="showAddDialog || showEditDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDialog"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="submitProduct">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ showAddDialog ? '添加商品' : '编辑商品' }}
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">商品名称</label>
                      <input 
                        v-model="formData.name" 
                        type="text" 
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">分类</label>
                      <select 
                        v-model="formData.category" 
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择分类</option>
                        <optgroup label="门类">
                          <option value="入户门">入户门</option>
                          <option value="房间门">房间门</option>
                          <option value="卫生间门">卫生间门</option>
                          <option value="厨房推拉门">厨房推拉门</option>
                          <option value="阳台推拉门">阳台推拉门</option>
                          <option value="折叠门">折叠门</option>
                        </optgroup>
                        <optgroup label="窗户类">
                          <option value="推拉窗">推拉窗</option>
                          <option value="平开窗">平开窗</option>
                        </optgroup>
                        <optgroup label="其他配件">
                          <option value="纱窗">纱窗</option>
                          <option value="防盗栏">防盗栏</option>
                          <option value="瓷膏">瓷膏</option>
                        </optgroup>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">描述</label>
                      <textarea 
                        v-model="formData.description" 
                        rows="3"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      ></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">价格</label>
                        <input 
                          v-model.number="formData.price" 
                          type="number" 
                          step="0.01"
                          required
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">价格单位</label>
                        <input 
                          v-model="formData.priceUnit" 
                          type="text" 
                          placeholder="如：平方米"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">商品图片</label>
                      <ImageUpload v-model="formData.image" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">规格（用逗号分隔）</label>
                      <input 
                        v-model="formData.specificationsText" 
                        type="text" 
                        placeholder="如：800x2000mm, 900x2100mm"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">颜色（用逗号分隔）</label>
                      <input 
                        v-model="formData.colorsText" 
                        type="text" 
                        placeholder="如：白色, 黑色, 棕色"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">特点（用逗号分隔）</label>
                      <input 
                        v-model="formData.featuresText" 
                        type="text" 
                        placeholder="如：防盗, 静音, 保温"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit"
                :disabled="submitting"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ submitting ? '提交中...' : (showAddDialog ? '添加' : '保存') }}
              </button>
              <button 
                type="button"
                @click="closeDialog"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteDialog = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">删除商品</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    确定要删除 "{{ productToDelete?.name }}" 吗？此操作无法撤销。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              @click="deleteProduct"
              :disabled="deleting"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ deleting ? '删除中...' : '删除' }}
            </button>
            <button 
              @click="showDeleteDialog = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ImageUpload from '../components/ImageUpload.vue'

const router = useRouter()

const products = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const productToDelete = ref(null)
const editingProduct = ref(null)

const formData = ref({
  name: '',
  category: '',
  description: '',
  price: 0,
  priceUnit: '平方米',
  image: '',
  specificationsText: '',
  colorsText: '',
  featuresText: ''
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

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch('/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      products.value = result.data || []
    } else if (response.status === 401 || response.status === 403) {
      // Token过期或无权限，跳转到登录页
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    } else {
      console.error('获取商品失败:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    category: '',
    description: '',
    price: 0,
    priceUnit: '平方米',
    image: '',
    specificationsText: '',
    colorsText: '',
    featuresText: ''
  }
}

// 关闭对话框
const closeDialog = () => {
  showAddDialog.value = false
  showEditDialog.value = false
  editingProduct.value = null
  resetForm()
}

// 编辑商品
const editProduct = (product) => {
  editingProduct.value = product
  formData.value = {
    name: product.name || '',
    category: product.category || '',
    description: product.description || '',
    price: product.price || 0,
    priceUnit: product.priceUnit || '平方米',
    image: product.image || '',
    specificationsText: product.specifications ? product.specifications.join(', ') : '',
    colorsText: product.colors ? product.colors.join(', ') : '',
    featuresText: product.features ? product.features.join(', ') : ''
  }
  showEditDialog.value = true
}

// 提交商品
const submitProduct = async () => {
  submitting.value = true
  try {
    const token = localStorage.getItem('admin_token')
    
    // 处理数组字段
    const productData = {
      ...formData.value,
      specifications: formData.value.specificationsText ? 
        formData.value.specificationsText.split(',').map(s => s.trim()).filter(s => s) : [],
      colors: formData.value.colorsText ? 
        formData.value.colorsText.split(',').map(s => s.trim()).filter(s => s) : [],
      features: formData.value.featuresText ? 
        formData.value.featuresText.split(',').map(s => s.trim()).filter(s => s) : []
    }
    
    // 删除文本字段
    delete productData.specificationsText
    delete productData.colorsText
    delete productData.featuresText
    
    const url = showEditDialog.value ? 
      `/api/products/${editingProduct.value.id}` : 
      '/api/products'
    
    const method = showEditDialog.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    })
    
    if (response.ok) {
      await fetchProducts()
      closeDialog()
    } else {
      const error = await response.json()
      alert(error.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to submit product:', error)
    alert('网络错误，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 确认删除
const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteDialog.value = true
}

// 删除商品
const deleteProduct = async () => {
  deleting.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const response = await fetch(`/api/products/${productToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      await fetchProducts()
      showDeleteDialog.value = false
      productToDelete.value = null
    } else {
      const error = await response.json()
      alert(error.message || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete product:', error)
    alert('网络错误，请稍后重试')
  } finally {
    deleting.value = false
  }
}

// 获取图片URL - 处理相对路径和绝对路径
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return ''
  
  // 如果是完整的URL（http/https），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // 如果是相对路径，尝试通过代理访问
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl
  }
  
  // 其他情况直接返回
  return imageUrl
}

// 处理图片加载错误
const handleImageError = (event, originalUrl, productId) => {
  console.log('商品图片加载失败，尝试直接访问后端:', originalUrl)
  
  // 如果通过代理失败，尝试直接访问后端
  if (originalUrl && originalUrl.startsWith('/uploads/') && !event.target.dataset.retried) {
    const directUrl = `http://localhost:3000${originalUrl}`
    event.target.src = directUrl
    event.target.dataset.retried = 'true' // 标记已重试，避免无限循环
    console.log('切换到直接访问:', directUrl)
  } else {
    // 如果仍然失败，隐藏图片显示占位符
    console.log('图片完全加载失败，显示占位符:', productId)
    event.target.style.display = 'none'
    
    // 找到对应的占位符并显示
    const placeholder = document.querySelector(`[data-placeholder="${productId}"]`)
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }
}

onMounted(() => {
  if (checkAuth()) {
    fetchProducts()
  }
})
</script>

<style scoped>
/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  max-height: 2.4em;
}

/* 确保表格布局稳定 */
table {
  table-layout: fixed;
}

/* 操作按钮容器确保足够宽度 */
.action-buttons {
  min-width: 140px;
}

/* 商品信息列的flex布局优化 */
.product-info {
  min-width: 0;
}

/* 确保按钮不换行 */
.flex.items-center.space-x-2 {
  flex-wrap: nowrap;
}
</style> 