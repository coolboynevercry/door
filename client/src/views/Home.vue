<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            专业门窗 <br />
            <span class="text-primary-200">品质生活</span>
          </h1>
          <p class="text-xl md:text-2xl text-primary-100 mb-8">
            宝得利门窗，为您打造舒适安全的家居环境
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="scrollToProducts" 
                    class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              浏览产品
            </button>
            <button @click="goToChat" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              联系我们
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-secondary-900 mb-4">为什么选择宝得利？</h2>
          <p class="text-secondary-600 max-w-2xl mx-auto">
            我们专注于门窗制造多年，致力于为客户提供最优质的产品和服务
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold mb-2">品质保证</h3>
            <p class="text-secondary-600">严格的质量控制，确保每一扇门窗都符合最高标准</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WrenchScrewdriverIcon class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold mb-2">专业安装</h3>
            <p class="text-secondary-600">经验丰富的安装团队，提供专业的安装服务</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold mb-2">贴心服务</h3>
            <p class="text-secondary-600">从咨询到售后，全程贴心服务，让您无忧选购</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <CategoryHierarchy 
          @filter-change="handleFilterChange" 
          :selected-filter="currentFilter" 
        />
      </div>
    </section>

    <!-- Products Section -->
    <section ref="productsSection" data-products-section class="py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-secondary-900 mb-4">热门产品</h2>
          <p class="text-secondary-600">精选优质门窗产品，为您的家居增添美感</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProductCard v-for="product in filteredProducts" 
                       :key="product.id" 
                       :product="product" />
        </div>
        
        <div v-if="filteredProducts.length === 0" class="text-center py-12">
          <p class="text-secondary-500">暂无相关产品</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShieldCheckIcon, WrenchScrewdriverIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { useProductStore } from '../stores'
import ProductCard from '../components/ProductCard.vue'
import CategoryHierarchy from '../components/CategoryHierarchy.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const productsSection = ref(null)
const currentFilter = ref({
  primaryCategory: null,
  subcategory: null,
  material: null
})

const products = computed(() => productStore.products)

const filteredProducts = computed(() => {
  const filter = currentFilter.value
  
  // 如果没有任何筛选条件，返回所有产品
  if (!filter.primaryCategory && !filter.subcategory && !filter.material) {
    return products.value
  }
  
  // 如果只有一级分类筛选
  if (filter.primaryCategory && !filter.subcategory && !filter.material) {
    return productStore.getProductsByCategory(filter.primaryCategory)
  }
  
  // 如果有二级分类筛选
  if (filter.subcategory && !filter.material) {
    return productStore.getProductsBySubcategory(filter.subcategory)
  }
  
  // 如果有三级分类（材质）筛选
  if (filter.subcategory && filter.material) {
    return productStore.getProductsByMaterial(filter.subcategory, filter.material)
  }
  
  return products.value
})

const handleFilterChange = (filterData) => {
  currentFilter.value = filterData
  
  // 更新URL参数
  const query = {}
  if (filterData.primaryCategory) query.primaryCategory = filterData.primaryCategory
  if (filterData.subcategory) query.subcategory = filterData.subcategory
  if (filterData.material) query.material = filterData.material
  
  router.replace({ query })
  
  // 平滑滚动到产品区域
  setTimeout(() => {
    scrollToProducts()
  }, 100)
}

const scrollToProducts = () => {
  productsSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const goToChat = () => {
  router.push('/chat')
}

onMounted(async () => {
  // 获取产品数据
  await productStore.fetchProducts()
  
  // 从URL恢复筛选状态
  updateFilterFromRoute()
})

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  updateFilterFromRoute()
}, { deep: true })

// 从路由参数更新筛选器
const updateFilterFromRoute = () => {
  const query = route.query
  const hasFilter = query.primaryCategory || query.subcategory || query.material
  
  if (hasFilter) {
    currentFilter.value = {
      primaryCategory: query.primaryCategory || null,
      subcategory: query.subcategory || null,
      material: query.material || null
    }
    
    // 自动滚动到产品区域
    setTimeout(() => {
      scrollToProducts()
    }, 100)
  } else {
    // 如果没有筛选参数，清空筛选器
    currentFilter.value = {
      primaryCategory: null,
      subcategory: null,
      material: null
    }
  }
}
</script> 