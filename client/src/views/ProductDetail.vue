<template>
  <div class="container mx-auto px-4 py-8" v-if="product">
    <!-- Breadcrumb -->
    <nav class="flex mb-8 text-sm sticky top-20 bg-white z-10 py-4 border-b border-gray-100">
      <router-link to="/" class="text-primary-600 hover:text-primary-700">首页</router-link>
      <span class="mx-2 text-secondary-400">/</span>
      <span class="text-secondary-600">{{ product.category }}</span>
      <span class="mx-2 text-secondary-400">/</span>
      <span class="text-secondary-900">{{ product.name }}</span>
    </nav>

    <!-- Product Main Content - Left/Right Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <!-- Left: Product Images -->
      <div class="space-y-4 sticky top-32 self-start">
        <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
          <img :src="product.image" :alt="product.name" 
               class="w-full h-[500px] object-cover rounded-lg" />
        </div>
        
        <!-- Additional Images (placeholder) -->
        <div class="grid grid-cols-4 gap-4">
                      <div v-for="i in 4" :key="i" 
                 class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
             <img :src="product.image" :alt="`${product.name} ${i}`" 
                   class="w-full h-20 object-cover rounded-lg" />
          </div>
        </div>
      </div>

      <!-- Right: Product Info & Purchase Options -->
      <div class="space-y-6">
        <!-- Product Title -->
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-secondary-900">{{ product.name }}</h1>
            <span class="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
              {{ product.category }}
            </span>
          </div>
          <p class="text-secondary-600">{{ product.description }}</p>
        </div>

        <!-- Product Type/Variant Selection -->
        <div v-if="product.variants && product.variants.length">
          <h3 class="text-lg font-semibold mb-3">产品类型</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <button v-for="variant in product.variants" :key="variant.type"
                    @click="selectedVariant = variant"
                    :class="[
                      'border-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-sm',
                      selectedVariant?.type === variant.type
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    ]">
              {{ variant.type }}
            </button>
          </div>
          
          <!-- Selected Variant Details -->
          <div v-if="selectedVariant" class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-gray-900 mb-1">{{ selectedVariant.type }}</h4>
                <p class="text-sm text-gray-600 mb-2">{{ selectedVariant.material }}</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="feature in selectedVariant.features.slice(0, 3)" :key="feature"
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {{ feature }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-lg font-bold text-orange-600">¥{{ selectedVariant.price }}</span>
                <span class="text-sm text-gray-500">/{{ selectedVariant.priceUnit }}</span>
              </div>
            </div>
            <div v-if="selectedVariant.notes" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              💡 {{ selectedVariant.notes }}
            </div>
          </div>
        </div>

        <!-- Material (for products without variants) -->
        <div v-else-if="product.material">
          <h3 class="text-lg font-semibold mb-3">材料</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <span class="text-secondary-700 font-medium">{{ product.material }}</span>
          </div>
        </div>

        <!-- Features -->
        <div v-if="displayFeatures && displayFeatures.length">
          <h3 class="text-lg font-semibold mb-3">产品特点</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="feature in displayFeatures" :key="feature"
                  class="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm">
              {{ feature }}
            </span>
          </div>
        </div>

        <!-- Colors -->
        <div v-if="product.colors && product.colors.length">
          <h3 class="text-lg font-semibold mb-3">颜色选择</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="color in product.colors" :key="color"
                    @click="selectedColor = color"
                    :class="[
                      'relative border-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-sm min-w-[80px]',
                      selectedColor === color
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    ]">
              <span class="flex items-center justify-center gap-2">
                <!-- Color indicator dot -->
                <span 
                  :class="[
                    'w-3 h-3 rounded-full border border-gray-300',
                    getColorClass(color)
                  ]"></span>
                {{ color }}
              </span>
              <!-- Selected indicator -->
              <div v-if="selectedColor === color" 
                   class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Specifications -->
        <div v-if="displaySpecifications && displaySpecifications.length">
          <h3 class="text-lg font-semibold mb-3">规格选择</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="spec in displaySpecifications" :key="spec"
                    @click="selectedSpecification = spec"
                    :class="[
                      'border-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-sm',
                      selectedSpecification === spec
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    ]">
              {{ spec }}
            </button>
          </div>
        </div>

        <!-- Price & Purchase Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 sticky top-32 shadow-lg">
          <!-- Price Display -->
          <div class="mb-6">
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-4xl font-bold text-red-600">¥{{ displayPrice }}</span>
              <span class="text-gray-500 text-lg">/{{ displayPriceUnit }}</span>
              <div v-if="displayPriceRange" class="text-sm text-gray-400 ml-2">
                ({{ displayPriceRange }})
              </div>
            </div>
            <div class="text-sm text-gray-600">
              <span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-2">特价</span>
              全场包邮，免费安装
            </div>
          </div>
          
          <!-- Selected Options Summary -->
          <div v-if="selectedVariant || selectedColor || selectedSpecification" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="text-sm font-semibold text-blue-800 mb-2">已选择</h4>
            <div class="text-sm text-blue-700 space-y-1">
              <p v-if="selectedVariant">类型: {{ selectedVariant.type }} - {{ selectedVariant.material }}</p>
              <p v-if="selectedColor">颜色: {{ selectedColor }}</p>
              <p v-if="selectedSpecification">规格: {{ selectedSpecification }}</p>
            </div>
          </div>
          
          <!-- Quantity Selector -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-medium text-gray-700">数量</label>
              <span class="text-sm text-gray-500">有货 (限购2件)</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center border border-gray-300 rounded-lg">
                <button @click="decreaseQuantity" 
                        class="px-4 py-2 hover:bg-gray-100 transition-colors border-r border-gray-300">
                  <MinusIcon class="w-4 h-4" />
                </button>
                <input v-model="quantity" 
                       type="number" 
                       min="1" 
                       max="2"
                       class="w-16 text-center border-0 focus:ring-0 py-2" />
                <button @click="increaseQuantity" 
                        class="px-4 py-2 hover:bg-gray-100 transition-colors border-l border-gray-300">
                  <PlusIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="text-right flex-1">
                <div class="text-sm text-gray-600">小计</div>
                <div class="text-xl font-bold text-red-600">¥{{ totalPrice.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button @click="buyNow" 
                    class="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              立即购买
            </button>
            <button @click="addToCart" 
                    class="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              <ShoppingCartIcon class="w-5 h-5" />
              加入购物车
            </button>
          </div>

          <!-- Additional Services -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <TruckIcon class="w-4 h-4 text-green-600" />
                <span>免费配送到门</span>
              </div>
              <div class="flex items-center gap-2">
                <ShieldCheckIcon class="w-4 h-4 text-blue-600" />
                <span>质保3年，终身维护</span>
              </div>
              <div class="flex items-center gap-2">
                <WrenchScrewdriverIcon class="w-4 h-4 text-purple-600" />
                <span>专业安装团队</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Related Products -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold text-secondary-900 mb-8">相关产品</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard v-for="relatedProduct in relatedProducts" 
                     :key="relatedProduct.id" 
                     :product="relatedProduct" />
      </div>
    </div>
  </div>

  <!-- Product Not Found -->
  <div v-else class="container mx-auto px-4 py-16 text-center">
    <h1 class="text-2xl font-bold text-secondary-900 mb-4">产品未找到</h1>
    <p class="text-secondary-600 mb-8">抱歉，您查找的产品不存在。</p>
    <router-link to="/" class="btn-primary">
      返回首页
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ShoppingCartIcon, 
  MinusIcon, 
  PlusIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  WrenchScrewdriverIcon 
} from '@heroicons/vue/24/outline'
import { useProductStore, useCartStore } from '../stores'
import ProductCard from '../components/ProductCard.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const quantity = ref(1)
const selectedSpecification = ref('')
const selectedColor = ref('')
const selectedVariant = ref(null)

const product = computed(() => productStore.getProductById(props.id))

const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.getProductsByCategory(product.value.category)
    .filter(p => p.id !== product.value.id)
    .slice(0, 4)
})

const displayPrice = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.price
  }
  return product.value?.price || 0
})

const displayPriceUnit = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.priceUnit || '个'
  }
  return product.value?.priceUnit || '个'
})

const displayPriceRange = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.priceRange || null
  }
  return product.value?.priceRange || null
})

const displayFeatures = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.features || []
  }
  return product.value?.features || []
})

const displaySpecifications = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.specifications || []
  }
  return product.value?.specifications || []
})

const displayNotes = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.notes || null
  }
  return product.value?.notes || null
})

const totalPrice = computed(() => {
  return displayPrice.value * quantity.value
})

const getColorClass = (color) => {
  const colorMap = {
    '白色': 'bg-white',
    '黑色': 'bg-black',
    '灰色': 'bg-gray-500',
    '深灰': 'bg-gray-700',
    '浅灰': 'bg-gray-300',
    '咖啡色': 'bg-amber-800',
    '棕色': 'bg-yellow-800',
    '深棕': 'bg-yellow-900',
    '木色': 'bg-yellow-600',
    '原木色': 'bg-amber-600',
    '红色': 'bg-red-500',
    '绿色': 'bg-green-500',
    '蓝色': 'bg-blue-500',
    '金色': 'bg-yellow-400',
    '银色': 'bg-gray-400'
  }
  return colorMap[color] || 'bg-gray-400'
}

const increaseQuantity = () => {
  quantity.value += 1
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

const addToCart = () => {
  if (!product.value) {
    alert('产品信息不存在')
    return
  }
  
  if (product.value.variants && product.value.variants.length > 0 && !selectedVariant.value) {
    alert('请选择产品类型')
    return
  }
  
  if (product.value.colors && product.value.colors.length > 0 && !selectedColor.value) {
    alert('请选择颜色')
    return
  }
  
  if (displaySpecifications.value && displaySpecifications.value.length > 0 && !selectedSpecification.value) {
    alert('请选择规格')
    return
  }
  
  const productToAdd = {
    id: product.value.id,
    name: [
      product.value.name,
      selectedVariant.value ? selectedVariant.value.type : null,
      selectedColor.value ? selectedColor.value : null,
      selectedSpecification.value ? selectedSpecification.value : null
    ].filter(Boolean).join(' - '),
    price: displayPrice.value,
    priceUnit: displayPriceUnit.value,
    image: product.value.image,
    category: product.value.category,
    material: selectedVariant.value ? selectedVariant.value.material : product.value.material,
    selectedColor: selectedColor.value || null,
    selectedVariant: selectedVariant.value ? selectedVariant.value.type : null,
    selectedSpecification: selectedSpecification.value || null,
    quantity: quantity.value,
    notes: displayNotes.value
  }
  
  cartStore.addToCart(productToAdd)
  alert('已添加到购物车')
}

const buyNow = () => {
  if (!product.value) {
    alert('产品信息不存在')
    return
  }
  
  if (product.value.variants && product.value.variants.length > 0 && !selectedVariant.value) {
    alert('请选择产品类型')
    return
  }
  
  if (product.value.colors && product.value.colors.length > 0 && !selectedColor.value) {
    alert('请选择颜色')
    return
  }
  
  if (displaySpecifications.value && displaySpecifications.value.length > 0 && !selectedSpecification.value) {
    alert('请选择规格')
    return
  }
  
  addToCart()
  router.push('/cart')
}

onMounted(() => {
  if (product.value) {
    if (product.value.variants && product.value.variants.length > 0) {
      selectedVariant.value = product.value.variants[0]
    }
    
    if (product.value.colors && product.value.colors.length > 0) {
      selectedColor.value = product.value.colors[0]
    }
    
    if (displaySpecifications.value && displaySpecifications.value.length > 0) {
      selectedSpecification.value = displaySpecifications.value[0]
    } else if (product.value.specifications && product.value.specifications.length > 0) {
      selectedSpecification.value = product.value.specifications[0]
    }
  }
})
</script>
 