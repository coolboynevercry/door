<template>
  <div class="relative" ref="selectWrapper">
    <!-- 选择器按钮 -->
    <button
      @click="toggleDropdown"
      :class="[
        'w-full px-4 py-3 text-left bg-white border-2 rounded-lg transition-all duration-200 flex items-center justify-between',
        isOpen ? 'border-primary-500 ring-2 ring-primary-200' : 'border-secondary-300 hover:border-secondary-400',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
      ]"
      :disabled="disabled"
    >
      <span :class="[
        'block truncate',
        modelValue ? 'text-secondary-900' : 'text-secondary-500'
      ]">
        {{ displayValue || placeholder }}
      </span>
      <ChevronDownIcon 
        :class="[
          'w-5 h-5 transition-transform duration-200',
          isOpen ? 'transform rotate-180 text-primary-600' : 'text-secondary-400'
        ]" 
      />
    </button>

    <!-- 下拉选项 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        <div class="py-1">
          <!-- 搜索框 -->
          <div v-if="searchable" class="px-3 py-2 border-b border-secondary-100">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索区县..."
              class="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <!-- 选项列表 -->
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              @click="selectOption(option)"
              :class="[
                'w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-150 flex items-center justify-between',
                modelValue === option.value ? 'bg-primary-100 text-primary-900' : 'text-secondary-900'
              ]"
            >
              <span class="block truncate">{{ option.label }}</span>
              <CheckIcon 
                v-if="modelValue === option.value"
                class="w-5 h-5 text-primary-600" 
              />
            </button>
            
            <!-- 无搜索结果 -->
            <div v-if="filteredOptions.length === 0" class="px-4 py-3 text-sm text-secondary-500 text-center">
              暂无匹配结果
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const selectWrapper = ref(null)
const searchInput = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')

const displayValue = computed(() => {
  const selectedOption = props.options.find(option => option.value === props.modelValue)
  return selectedOption ? selectedOption.label : ''
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  
  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const toggleDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = !isOpen.value
  
  if (isOpen.value && props.searchable) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
  searchQuery.value = ''
}

const closeDropdown = (event) => {
  if (selectWrapper.value && !selectWrapper.value.contains(event.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

// 监听点击外部关闭下拉菜单
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// 清除搜索当选项改变时
watch(() => props.modelValue, () => {
  searchQuery.value = ''
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.max-h-48::-webkit-scrollbar {
  width: 6px;
}

.max-h-48::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.max-h-48::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.max-h-48::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 