<template>
  <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <router-link v-if="!isAdminPage" to="/" class="text-2xl font-bold text-primary-600">
            宝得利门窗
          </router-link>
          <router-link v-else to="/admin" class="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            管理后台
          </router-link>
        </div>
        
        <div v-if="!isAdminPage" class="hidden md:flex items-center space-x-8">
          <router-link to="/" class="text-secondary-700 hover:text-primary-600 transition-colors">
            首页
          </router-link>
          <router-link to="/chat" class="text-secondary-700 hover:text-primary-600 transition-colors">
            联系我们
          </router-link>
          <div class="relative group">
            <button class="text-secondary-700 hover:text-primary-600 transition-colors flex items-center">
              产品分类
              <ChevronDownIcon class="w-4 h-4 ml-1" />
            </button>
            <div class="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
              <div class="py-2">
                <!-- 一级分类展示 -->
                <div v-for="(categoryData, primaryKey) in categoryHierarchy" :key="primaryKey" class="border-b border-gray-100 last:border-b-0">
                  <!-- 一级分类标题 -->
                  <div 
                    @click="filterByCategory(primaryKey)"
                    class="px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <div class="flex items-center">
                      <span class="mr-2">{{ categoryData.icon }}</span>
                      <span>{{ categoryData.name }}</span>
                    </div>
                    <span class="text-xs text-gray-500">({{ getProductsByCategory(primaryKey).length }})</span>
                  </div>
                  
                  <!-- 二级分类展示 -->
                  <div class="pl-6 bg-gray-50">
                    <div 
                      v-for="(subcategoryData, subcategoryKey) in categoryData.subcategories"
                      :key="subcategoryKey"
                      @click="filterBySubcategory(primaryKey, subcategoryKey)"
                      class="px-4 py-1 text-xs text-secondary-600 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{{ subcategoryData.name }}</span>
                      <span class="text-xs text-gray-400">({{ getSubcategoryProductCount(subcategoryKey) }})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <router-link v-if="!isAdminPage" to="/cart" class="relative p-2 text-secondary-700 hover:text-primary-600 transition-colors">
            <ShoppingCartIcon class="w-6 h-6" />
            <span v-if="cartItemCount > 0" 
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartItemCount }}
            </span>
          </router-link>
          
          <!-- 用户登录状态 -->
          <div class="relative group hidden md:block">
            <button v-if="userStore.isLoggedIn" 
                    class="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors">
              <UserIcon class="w-5 h-5" />
              <span class="text-sm">{{ userStore.userName }}</span>
              <ChevronDownIcon class="w-4 h-4" />
            </button>
            <div v-else class="flex items-center space-x-4">
              <router-link 
                to="/login" 
                class="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors">
                <UserIcon class="w-5 h-5" />
                <span class="text-sm">登录</span>
              </router-link>
              <router-link 
                to="/register" 
                class="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                注册
              </router-link>
            </div>
            
            <!-- 用户下拉菜单 -->
            <div v-if="userStore.isLoggedIn" 
                 class="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
              <div class="py-2">
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ userStore.userName }}</p>
                  <p class="text-xs text-gray-500">{{ userStore.userPhone }}</p>
                </div>
                <router-link 
                  v-if="!isAdminPage"
                  to="/orders"
                  class="block px-4 py-2 text-sm text-secondary-700 hover:bg-gray-50 transition-colors"
                >
                  我的订单
                </router-link>
                <button @click="handleLogout" 
                        class="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-gray-50 transition-colors">
                  退出登录
                </button>
              </div>
            </div>
          </div>
          
          <button class="md:hidden p-2 text-secondary-700" @click="toggleMobileMenu">
            <Bars3Icon class="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden mt-4 pb-4 bg-white border-t border-gray-200 mobile-menu">
        <div class="flex flex-col space-y-4">
          <router-link v-if="!isAdminPage" to="/" class="text-secondary-700 hover:text-primary-600 transition-colors">
            首页
          </router-link>
          <router-link v-if="!isAdminPage" to="/chat" @click="showMobileMenu = false" class="text-secondary-700 hover:text-primary-600 transition-colors">
            联系我们
          </router-link>
          
          <!-- 移动端用户状态 -->
          <div class="border-t pt-4">
            <div v-if="userStore.isLoggedIn" class="space-y-2">
              <div class="flex items-center space-x-2 text-secondary-700">
                <UserIcon class="w-5 h-5" />
                <div>
                  <p class="text-sm font-medium">{{ userStore.userName }}</p>
                  <p class="text-xs text-gray-500">{{ userStore.userPhone }}</p>
                </div>
              </div>
              <router-link 
                v-if="!isAdminPage"
                to="/orders" 
                @click="showMobileMenu = false"
                class="block text-sm text-secondary-600 hover:text-primary-600 transition-colors">
                我的订单
              </router-link>
              <button @click="handleLogout" 
                      class="text-sm text-secondary-600 hover:text-primary-600 transition-colors">
                退出登录
              </button>
            </div>
            <div v-else class="space-y-2">
              <router-link 
                to="/login" 
                @click="showMobileMenu = false"
                class="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors">
                <UserIcon class="w-5 h-5" />
                <span class="text-sm">登录</span>
              </router-link>
              <router-link 
                to="/register" 
                @click="showMobileMenu = false"
                class="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                <UserIcon class="w-5 h-5" />
                <span>注册账户</span>
              </router-link>
            </div>
          </div>
          
          <div v-if="!isAdminPage" class="border-t pt-4">
            <p class="text-sm font-medium text-secondary-600 mb-2">产品分类</p>
            <div class="space-y-3">
              <div v-for="(categoryData, primaryKey) in categoryHierarchy" :key="primaryKey" class="border-b border-gray-100 pb-2 last:border-b-0">
                <!-- 一级分类 -->
                <div 
                  @click="filterByCategory(primaryKey)"
                  class="flex items-center justify-between text-sm text-secondary-700 hover:text-primary-600 cursor-pointer font-medium"
                >
                  <div class="flex items-center">
                    <span class="mr-2">{{ categoryData.icon }}</span>
                    <span>{{ categoryData.name }}</span>
                  </div>
                  <span class="text-xs text-gray-500">({{ getProductsByCategory(primaryKey).length }})</span>
                </div>
                
                <!-- 二级分类 -->
                <div class="pl-6 mt-2 space-y-1">
                  <div 
                    v-for="(subcategoryData, subcategoryKey) in categoryData.subcategories"
                    :key="subcategoryKey"
                    @click="filterBySubcategory(primaryKey, subcategoryKey)"
                    class="flex items-center justify-between text-xs text-secondary-600 hover:text-primary-600 cursor-pointer"
                  >
                    <span>{{ subcategoryData.name }}</span>
                    <span class="text-xs text-gray-400">({{ getSubcategoryProductCount(subcategoryKey) }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronDownIcon, ShoppingCartIcon, Bars3Icon, UserIcon } from '@heroicons/vue/24/outline'
import { useProductStore, useCartStore, useUserStore } from '../stores'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const showMobileMenu = ref(false)

// 判断是否为管理员页面
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin')
})

const categoryHierarchy = computed(() => productStore.getCategoryHierarchy)
const cartItemCount = computed(() => cartStore.cartItemCount)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const getProductsByCategory = (category) => {
  return productStore.getProductsByCategory(category)
}

const getSubcategoryProductCount = (subcategory) => {
  return productStore.getSubcategoryProductCount(subcategory)
}

const filterByCategory = (category) => {
  // 如果已经在首页，不使用路由跳转，而是直接更新URL参数
  if (router.currentRoute.value.name === 'Home') {
    router.replace({ query: { primaryCategory: category } })
    // 滚动到产品区域
    setTimeout(() => {
      const productsSection = document.querySelector('[data-products-section]')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  } else {
    // 如果不在首页，跳转到首页并设置分类
    router.push({ name: 'Home', query: { primaryCategory: category } })
  }
  showMobileMenu.value = false
}

const filterBySubcategory = (primaryCategory, subcategory) => {
  // 如果已经在首页，不使用路由跳转，而是直接更新URL参数
  if (router.currentRoute.value.name === 'Home') {
    router.replace({ query: { primaryCategory, subcategory } })
    // 滚动到产品区域
    setTimeout(() => {
      const productsSection = document.querySelector('[data-products-section]')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  } else {
    // 如果不在首页，跳转到首页并设置分类
    router.push({ name: 'Home', query: { primaryCategory, subcategory } })
  }
  showMobileMenu.value = false
}

const handleLogout = () => {
  userStore.logout()
  showMobileMenu.value = false
  // 如果当前在需要登录的页面，跳转到首页
  if (router.currentRoute.value.name === 'Order') {
    router.push('/')
  }
}

onMounted(() => {
  // 检查用户登录状态
  userStore.checkLoginStatus()
})
</script>

<style scoped>
/* 固定导航栏优化样式 */
header {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: box-shadow 0.2s ease-in-out;
}

/* 确保下拉菜单在固定导航栏中正确显示 */
.group:hover .group-hover\:opacity-100 {
  position: absolute;
  top: 100%;
  margin-top: 0.5rem;
}

/* 移动端菜单优化 */
@media (max-width: 768px) {
  .mobile-menu {
    max-height: calc(100vh - 5rem);
    overflow-y: auto;
  }
}

/* 平滑过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style> 