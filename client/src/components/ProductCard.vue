<template>
  <div class="card hover:shadow-lg transition-shadow duration-200">
    <div class="aspect-w-16 aspect-h-9 bg-gray-200 relative">
      <img :src="getImageUrl(product.image)" :alt="product.name" 
           class="w-full h-48 object-cover" 
           @error="handleImageError"
           v-if="product.image" />
      <div v-else class="w-full h-48 bg-gray-100 flex items-center justify-center">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
    </div>
    
    <div class="p-6">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-semibold text-secondary-900">{{ product.name }}</h3>
        <span class="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
          {{ getFrontendCategory(product.category) }}
        </span>
      </div>
      
      <p class="text-secondary-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>
      
      <!-- Variants信息 -->
      <div v-if="product.variants && product.variants.length" class="mb-3">
        <span class="text-xs text-secondary-500">{{ product.variants.length }}种类型可选：</span>
        <div class="flex flex-wrap gap-1 mt-1">
          <span v-for="variant in product.variants.slice(0, 2)" :key="variant.type"
                class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {{ variant.type }}
          </span>
          <span v-if="product.variants.length > 2"
                class="text-xs text-secondary-500">
            +{{ product.variants.length - 2 }}种
          </span>
        </div>
      </div>
      
      <!-- 材料信息（仅对无variants的产品显示） -->
      <div v-else-if="product.material" class="mb-3">
        <span class="text-xs text-secondary-500">材料：</span>
        <span class="text-sm font-medium text-secondary-700">{{ product.material }}</span>
      </div>
      
      <!-- 规格信息（仅对无variants的产品显示） -->
      <div v-if="!product.variants && product.specifications && product.specifications.length" class="mb-3">
        <div class="flex flex-wrap gap-1">
          <span v-for="spec in product.specifications.slice(0, 2)" :key="spec"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {{ spec }}
          </span>
          <span v-if="product.specifications.length > 2"
                class="text-xs text-gray-500">
            +{{ product.specifications.length - 2 }}项
          </span>
        </div>
      </div>
      
      <!-- 颜色选择 -->
      <div v-if="product.colors && product.colors.length" class="mb-3">
        <span class="text-xs text-secondary-500 block mb-1">可选颜色：</span>
        <div class="flex flex-wrap gap-1">
          <span v-for="color in product.colors" :key="color"
                class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            {{ color }}
          </span>
        </div>
      </div>
      
      <!-- 产品特点 -->
      <div v-if="product.features && product.features.length" class="mb-4">
        <div class="flex flex-wrap gap-1">
          <span v-for="feature in product.features.slice(0, 3)" :key="feature"
                class="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
            {{ feature }}
          </span>
          <span v-if="product.features.length > 3"
                class="text-xs text-secondary-500">
            +{{ product.features.length - 3 }}项
          </span>
        </div>
      </div>
      
      <!-- 备注信息（仅对无variants的产品显示） -->
      <div v-if="!product.variants && product.notes" class="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <span class="text-xs text-yellow-700">💡 {{ product.notes }}</span>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="text-2xl font-bold text-primary-600">
          ¥{{ product.price }}
          <span class="text-sm text-secondary-500 font-normal">/{{ product.priceUnit || '个' }}</span>
          <div v-if="product.priceRange" class="text-xs text-secondary-400">
            ({{ product.priceRange }})
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button @click="viewDetails" 
                  class="btn-secondary text-sm py-1 px-3">
            查看详情
          </button>
          <button @click="addToCart" 
                  class="btn-primary text-sm py-1 px-3">
            加入购物车
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore, useProductStore } from '../stores'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

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
const handleImageError = (event) => {
  const originalUrl = props.product.image
  console.log('产品图片加载失败，尝试直接访问后端:', originalUrl)
  
  // 如果通过代理失败，尝试直接访问后端
  if (originalUrl && originalUrl.startsWith('/uploads/') && !event.target.dataset.retried) {
    const directUrl = `http://localhost:3000${originalUrl}`
    event.target.src = directUrl
    event.target.dataset.retried = 'true'
    console.log('切换到直接访问:', directUrl)
  } else {
    // 如果仍然失败，隐藏图片
    event.target.style.display = 'none'
  }
}

// 获取前端分类显示
const getFrontendCategory = (dbCategory) => {
  const categoryMapping = {
    '入户门': '门', '房间门': '门', '卫生间门': '门', 
    '厨房推拉门': '门', '阳台推拉门': '门', '折叠门': '门',
    '推拉窗': '窗户', '平开窗': '窗户',
    '纱窗': '其他配件', '防盗栏': '其他配件', '瓷膏': '其他配件'
  }
  return categoryMapping[dbCategory] || '其他配件'
}

const viewDetails = () => {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } })
}

const addToCart = () => {
  // 如果产品有variants，则跳转到详情页进行选择
  if (props.product.variants && props.product.variants.length > 0) {
    viewDetails()
    return
  }
  
  // 如果产品有颜色选择，也跳转到详情页
  if (props.product.colors && props.product.colors.length > 0) {
    viewDetails()
    return
  }
  
  // 对于简单产品，直接添加到购物车
  const productToAdd = {
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    priceUnit: props.product.priceUnit || '个',
    image: props.product.image,
    category: props.product.category,
    material: props.product.material,
    selectedColor: null,
    selectedVariant: null,
    quantity: 1,
    notes: props.product.notes
  }
  
  cartStore.addToCart(productToAdd)
  alert('已添加到购物车')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 