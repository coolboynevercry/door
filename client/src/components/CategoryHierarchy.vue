<template>
  <div class="category-hierarchy">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-secondary-900 mb-4">产品分类</h2>
      <p class="text-secondary-600">按分类和材质精确筛选您需要的产品</p>
    </div>

    <!-- 分类筛选按钮 -->
    <div class="flex flex-wrap justify-center gap-4 mb-8">
      <button 
        @click="clearAllFilters"
        :class="[
          'px-6 py-2 rounded-full transition-colors',
          !selectedPrimaryCategory && !selectedSubcategory && !selectedMaterial
            ? 'bg-primary-600 text-white' 
            : 'bg-white text-secondary-700 hover:bg-primary-50 border border-gray-200'
        ]">
        全部产品
      </button>
    </div>

    <!-- 三级分类展示 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div 
        v-for="(categoryData, primaryKey) in categoryHierarchy" 
        :key="primaryKey"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- 一级分类标题 -->
        <div 
          @click="togglePrimaryCategory(primaryKey)"
          :class="[
            'p-4 cursor-pointer transition-colors flex items-center justify-between',
            selectedPrimaryCategory === primaryKey 
              ? 'bg-primary-100 border-b border-primary-200' 
              : 'hover:bg-gray-50'
          ]"
        >
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ categoryData.icon }}</span>
            <span class="font-semibold text-lg">{{ categoryData.name }}</span>
            <span class="ml-2 text-sm text-gray-500">
              ({{ getProductsByCategory(primaryKey).length }})
            </span>
          </div>
          <ChevronDownIcon 
            :class="[
              'w-5 h-5 text-gray-400 transition-transform',
              expandedCategories.includes(primaryKey) ? 'rotate-180' : ''
            ]" 
          />
        </div>

        <!-- 二级分类列表 -->
        <div 
          v-show="expandedCategories.includes(primaryKey)"
          class="border-t border-gray-100"
        >
          <div 
            v-for="(subcategoryData, subcategoryKey) in categoryData.subcategories"
            :key="subcategoryKey"
            class="border-b border-gray-50 last:border-b-0"
          >
            <!-- 二级分类 -->
            <div 
              @click="toggleSubcategory(primaryKey, subcategoryKey)"
              :class="[
                'px-4 py-3 cursor-pointer transition-colors flex items-center justify-between',
                selectedSubcategory === subcategoryKey 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-50'
              ]"
            >
              <span class="font-medium">{{ subcategoryData.name }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">
                  ({{ getSubcategoryProductCount(subcategoryKey) }})
                </span>
                <ChevronRightIcon 
                  :class="[
                    'w-4 h-4 text-gray-400 transition-transform',
                    expandedSubcategories.includes(subcategoryKey) ? 'rotate-90' : ''
                  ]" 
                />
              </div>
            </div>

            <!-- 三级分类（材质） -->
            <div 
              v-show="expandedSubcategories.includes(subcategoryKey)"
              class="bg-gray-50 border-t border-gray-100"
            >
              <div 
                v-for="material in subcategoryData.materials"
                :key="material"
                @click="selectMaterial(primaryKey, subcategoryKey, material)"
                :class="[
                  'px-8 py-2 cursor-pointer transition-colors flex items-center justify-between text-sm',
                  selectedMaterial === material && selectedSubcategory === subcategoryKey
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'hover:bg-gray-100 text-gray-600'
                ]"
              >
                <span>{{ material }}</span>
                <span class="text-xs text-gray-500">
                  ({{ getMaterialProductCount(subcategoryKey, material) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前筛选状态 -->
    <div v-if="selectedPrimaryCategory || selectedSubcategory || selectedMaterial" 
         class="bg-blue-50 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <FunnelIcon class="w-5 h-5 text-blue-600" />
          <span class="text-blue-800 font-medium">当前筛选：</span>
          <div class="flex items-center space-x-2 text-blue-700">
            <span v-if="selectedPrimaryCategory">{{ selectedPrimaryCategory }}</span>
            <ChevronRightIcon v-if="selectedPrimaryCategory && selectedSubcategory" class="w-4 h-4" />
            <span v-if="selectedSubcategory">{{ selectedSubcategory }}</span>
            <ChevronRightIcon v-if="selectedSubcategory && selectedMaterial" class="w-4 h-4" />
            <span v-if="selectedMaterial" class="font-semibold">{{ selectedMaterial }}</span>
          </div>
        </div>
        <button 
          @click="clearAllFilters"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          清除筛选
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronDownIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { useProductStore } from '../stores'

const props = defineProps({
  selectedFilter: {
    type: Object,
    default: () => ({
      primaryCategory: null,
      subcategory: null,
      material: null
    })
  }
})

const emit = defineEmits(['filter-change'])

const productStore = useProductStore()

// 响应式状态
const expandedCategories = ref([])
const expandedSubcategories = ref([])
const selectedPrimaryCategory = ref(null)
const selectedSubcategory = ref(null)
const selectedMaterial = ref(null)

// 计算属性
const categoryHierarchy = computed(() => productStore.getCategoryHierarchy)

// 方法
const getProductsByCategory = (category) => {
  return productStore.getProductsByCategory(category)
}

const getSubcategoryProductCount = (subcategory) => {
  return productStore.getSubcategoryProductCount(subcategory)
}

const getMaterialProductCount = (subcategory, material) => {
  return productStore.getMaterialProductCount(subcategory, material)
}

const togglePrimaryCategory = (categoryKey) => {
  if (expandedCategories.value.includes(categoryKey)) {
    expandedCategories.value = expandedCategories.value.filter(c => c !== categoryKey)
  } else {
    expandedCategories.value.push(categoryKey)
  }
  
  // 选择一级分类
  selectedPrimaryCategory.value = categoryKey
  selectedSubcategory.value = null
  selectedMaterial.value = null
  
  // 清除二级分类展开状态
  expandedSubcategories.value = []
  
  emitFilterChange()
}

const toggleSubcategory = (primaryKey, subcategoryKey) => {
  if (expandedSubcategories.value.includes(subcategoryKey)) {
    expandedSubcategories.value = expandedSubcategories.value.filter(s => s !== subcategoryKey)
  } else {
    expandedSubcategories.value.push(subcategoryKey)
  }
  
  // 选择二级分类
  selectedPrimaryCategory.value = primaryKey
  selectedSubcategory.value = subcategoryKey
  selectedMaterial.value = null
  
  emitFilterChange()
}

const selectMaterial = (primaryKey, subcategoryKey, material) => {
  selectedPrimaryCategory.value = primaryKey
  selectedSubcategory.value = subcategoryKey
  selectedMaterial.value = material
  
  emitFilterChange()
}

const clearAllFilters = () => {
  selectedPrimaryCategory.value = null
  selectedSubcategory.value = null
  selectedMaterial.value = null
  expandedCategories.value = []
  expandedSubcategories.value = []
  
  emitFilterChange()
}

const emitFilterChange = () => {
  emit('filter-change', {
    primaryCategory: selectedPrimaryCategory.value,
    subcategory: selectedSubcategory.value,
    material: selectedMaterial.value
  })
}

// 监听外部传入的筛选状态变化
watch(() => props.selectedFilter, (newFilter) => {
  if (newFilter) {
    selectedPrimaryCategory.value = newFilter.primaryCategory
    selectedSubcategory.value = newFilter.subcategory
    selectedMaterial.value = newFilter.material
    
    // 自动展开相关分类
    if (newFilter.primaryCategory) {
      if (!expandedCategories.value.includes(newFilter.primaryCategory)) {
        expandedCategories.value.push(newFilter.primaryCategory)
      }
    }
    
    if (newFilter.subcategory) {
      if (!expandedSubcategories.value.includes(newFilter.subcategory)) {
        expandedSubcategories.value.push(newFilter.subcategory)
      }
    }
  }
}, { immediate: true, deep: true })

// 监听产品数据变化，自动展开有产品的分类
watch(() => productStore.products, () => {
  // 可以在这里添加自动展开逻辑
}, { immediate: true })
</script>

<style scoped>
.category-hierarchy {
  /* 可以在这里添加特定样式 */
}

/* 过渡动画 */
.transition-transform {
  transition: transform 0.2s ease-in-out;
}

/* 滚动条美化 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 