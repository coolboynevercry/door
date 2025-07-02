<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-secondary-900 mb-8">购物车</h1>

    <div v-if="cartItems.length > 0">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div v-for="item in cartItems" :key="`${item.id}-${item.selectedColor}-${item.selectedVariant}`"
               class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center gap-4">
              <!-- Product Image -->
              <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img :src="item.image" :alt="item.name" 
                     class="w-full h-full object-cover" />
              </div>

              <!-- Product Info -->
              <div class="flex-grow">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-secondary-900">{{ item.name }}</h3>
                  <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{{ item.category }}</span>
                </div>
                
                <div class="space-y-1 text-sm text-secondary-600">
                  <p v-if="item.material">材料: {{ item.material }}</p>
                  <p v-if="item.selectedVariant">类型: {{ item.selectedVariant }}</p>
                  <p v-if="item.selectedColor">颜色: {{ item.selectedColor }}</p>
                  <p v-if="item.selectedSpecification">规格: {{ item.selectedSpecification }}</p>
                </div>
                
                <p class="text-primary-600 font-medium mt-2">¥{{ item.price }}/{{ item.priceUnit }}</p>
                
                <div v-if="item.notes" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  💡 {{ item.notes }}
                </div>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-3">
                <div class="flex items-center border border-secondary-300 rounded-lg">
                  <button @click="decreaseQuantity(item)" 
                          class="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <MinusIcon class="w-4 h-4" />
                  </button>
                  <span class="w-12 text-center">{{ item.quantity }}</span>
                  <button @click="increaseQuantity(item)" 
                          class="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <PlusIcon class="w-4 h-4" />
                  </button>
                </div>

                <!-- Item Total -->
                <div class="text-right min-w-[80px]">
                  <p class="font-semibold text-secondary-900">
                    ¥{{ (item.price * item.quantity).toFixed(2) }}
                  </p>
                </div>

                <!-- Remove Button -->
                <button @click="removeItem(item)" 
                        class="p-2 text-red-500 hover:text-red-700 transition-colors">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 class="text-xl font-semibold mb-4">订单摘要</h2>
            
            <div class="space-y-3 mb-6">
              <div class="flex justify-between">
                <span class="text-secondary-600">商品总数:</span>
                <span>{{ totalItems }}件</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">商品总价:</span>
                <span>¥{{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">配送费:</span>
                <span class="text-green-600">免费</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between text-lg font-semibold">
                  <span>总计:</span>
                  <span class="text-primary-600">¥{{ cartTotal.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <button @click="proceedToCheckout" 
                    class="w-full btn-primary mb-4">
              去结算
            </button>

            <button @click="clearCart" 
                    class="w-full btn-secondary">
              清空购物车
            </button>

            <!-- Benefits -->
            <div class="mt-6 space-y-3 text-sm text-secondary-600">
              <div class="flex items-center gap-2">
                <TruckIcon class="w-4 h-4" />
                <span>免费配送</span>
              </div>
              <div class="flex items-center gap-2">
                <ShieldCheckIcon class="w-4 h-4" />
                <span>品质保证</span>
              </div>
              <div class="flex items-center gap-2">
                <WrenchScrewdriverIcon class="w-4 h-4" />
                <span>专业安装</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCartIcon class="w-12 h-12 text-gray-400" />
      </div>
      <h2 class="text-2xl font-semibold text-secondary-900 mb-4">
        购物车是空的
      </h2>
      <p class="text-secondary-600 mb-8">
        还没有添加任何商品，去挑选一些心仪的门窗吧！
      </p>
      <router-link to="/" class="btn-primary">
        去购物
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ShoppingCartIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  TruckIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import { useCartStore } from '../stores'

const router = useRouter()
const cartStore = useCartStore()

const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.cartTotal)
const totalItems = computed(() => cartStore.cartItemCount)

const increaseQuantity = (item) => {
  cartStore.updateQuantity(item.id, item.selectedColor, item.selectedVariant, item.quantity + 1)
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.selectedColor, item.selectedVariant, item.quantity - 1)
  }
}

const removeItem = (item) => {
  if (confirm('确定要删除这个商品吗？')) {
    cartStore.removeFromCart(item.id, item.selectedColor, item.selectedVariant)
  }
}

const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cartStore.clearCart()
  }
}

const proceedToCheckout = () => {
  router.push('/order')
}
</script> 