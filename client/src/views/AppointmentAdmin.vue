<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 标题栏 -->
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center space-x-4">
          <router-link to="/admin" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">预约管理</h1>
            <p class="text-gray-600 mt-1">管理测量和安装预约</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">今日测量</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.todayMeasurements || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">今日安装</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.todayInstallations || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">待安排测量</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.pendingMeasurements || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">待安排安装</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.pendingInstallations || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="bg-white rounded-lg shadow">
        <!-- 标签头 -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex">
            <button
              @click="activeTab = 'measurements'"
              :class="[
                'py-4 px-6 border-b-2 font-medium text-sm',
                activeTab === 'measurements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              测量预约管理
            </button>
            <button
              @click="activeTab = 'installations'"
              :class="[
                'py-4 px-6 border-b-2 font-medium text-sm',
                activeTab === 'installations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              安装预约管理
            </button>
          </nav>
        </div>

        <!-- 标签内容 -->
        <div class="p-6">
          <!-- 测量预约管理 -->
          <div v-if="activeTab === 'measurements'">
            <!-- 筛选工具栏 -->
            <div class="flex flex-wrap gap-4 mb-6">
              <select v-model="measurementFilters.status" @change="loadMeasurements" class="px-3 py-2 border border-gray-300 rounded-md">
                <option value="all">全部状态</option>
                <option value="pending">待安排</option>
                <option value="scheduled">已安排</option>
                <option value="completed">已完成</option>
              </select>
              <input
                type="date"
                v-model="measurementFilters.date"
                @change="loadMeasurements"
                class="px-3 py-2 border border-gray-300 rounded-md"
              />
              <button @click="resetMeasurementFilters" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                重置筛选
              </button>
            </div>

            <!-- 测量预约列表 -->
            <div class="space-y-4">
              <div
                v-for="order in measurements.orders"
                :key="order.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-4 mb-2">
                      <h3 class="font-medium text-gray-900">订单号: {{ order.orderNo }}</h3>
                      <span :class="getStatusClass(order.status)" class="px-2 py-1 rounded-full text-xs">
                        {{ getStatusText(order.status) }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>客户:</strong> {{ order.customerName }}</p>
                        <p><strong>电话:</strong> {{ order.phone }}</p>
                        <p><strong>地址:</strong> {{ order.address }}</p>
                      </div>
                      <div>
                        <p v-if="order.measurementScheduled">
                          <strong>预约时间:</strong> {{ formatDateTime(order.measurementScheduled) }}
                        </p>
                        <p v-if="order.measurementCompleted">
                          <strong>完成时间:</strong> {{ formatDateTime(order.measurementCompleted) }}
                        </p>
                        <p><strong>订单金额:</strong> ¥{{ order.totalAmount }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex space-x-2 ml-4">
                    <button
                      v-if="!order.measurementScheduled"
                      @click="openScheduleModal('measurement', order)"
                      class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      安排预约
                    </button>
                    <button
                      v-if="order.measurementScheduled && !order.measurementCompleted"
                      @click="openCompleteModal('measurement', order)"
                      class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      完成测量
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="measurements.totalPages > 1" class="flex justify-center mt-6">
              <nav class="flex space-x-2">
                <button
                  v-for="page in measurements.totalPages"
                  :key="page"
                  @click="loadMeasurements(page)"
                  :class="[
                    'px-3 py-2 rounded',
                    page === measurements.page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ page }}
                </button>
              </nav>
            </div>
          </div>

          <!-- 安装预约管理 -->
          <div v-if="activeTab === 'installations'">
            <!-- 筛选工具栏 -->
            <div class="flex flex-wrap gap-4 mb-6">
              <select v-model="installationFilters.status" @change="loadInstallations" class="px-3 py-2 border border-gray-300 rounded-md">
                <option value="all">全部状态</option>
                <option value="pending">待安排</option>
                <option value="scheduled">已安排</option>
                <option value="completed">已完成</option>
              </select>
              <input
                type="date"
                v-model="installationFilters.date"
                @change="loadInstallations"
                class="px-3 py-2 border border-gray-300 rounded-md"
              />
              <button @click="resetInstallationFilters" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                重置筛选
              </button>
            </div>

            <!-- 安装预约列表 -->
            <div class="space-y-4">
              <div
                v-for="order in installations.orders"
                :key="order.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-4 mb-2">
                      <h3 class="font-medium text-gray-900">订单号: {{ order.orderNo }}</h3>
                      <span :class="getStatusClass(order.status)" class="px-2 py-1 rounded-full text-xs">
                        {{ getStatusText(order.status) }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>客户:</strong> {{ order.customerName }}</p>
                        <p><strong>电话:</strong> {{ order.phone }}</p>
                        <p><strong>地址:</strong> {{ order.address }}</p>
                      </div>
                      <div>
                        <p v-if="order.measurementCompleted">
                          <strong>测量完成:</strong> {{ formatDateTime(order.measurementCompleted) }}
                        </p>
                        <p v-if="order.installationScheduled">
                          <strong>安装预约:</strong> {{ formatDateTime(order.installationScheduled) }}
                        </p>
                        <p v-if="order.installationCompleted">
                          <strong>安装完成:</strong> {{ formatDateTime(order.installationCompleted) }}
                        </p>
                        <p><strong>订单金额:</strong> ¥{{ order.totalAmount }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex space-x-2 ml-4">
                    <button
                      v-if="!order.installationScheduled"
                      @click="openScheduleModal('installation', order)"
                      class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      安排预约
                    </button>
                    <button
                      v-if="order.installationScheduled && !order.installationCompleted"
                      @click="openCompleteModal('installation', order)"
                      class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      完成安装
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="installations.totalPages > 1" class="flex justify-center mt-6">
              <nav class="flex space-x-2">
                <button
                  v-for="page in installations.totalPages"
                  :key="page"
                  @click="loadInstallations(page)"
                  :class="[
                    'px-3 py-2 rounded',
                    page === installations.page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ page }}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安排预约弹框 -->
    <div v-if="scheduleModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          安排{{ scheduleModal.type === 'measurement' ? '测量' : '安装' }}预约
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预约时间</label>
            <input
              type="datetime-local"
              v-model="scheduleModal.scheduledTime"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              v-model="scheduleModal.notes"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="请输入备注信息..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="closeScheduleModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmSchedule"
            :disabled="!scheduleModal.scheduledTime"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            确认安排
          </button>
        </div>
      </div>
    </div>

    <!-- 完成任务弹框 -->
    <div v-if="completeModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          完成{{ completeModal.type === 'measurement' ? '测量' : '安装' }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">完成备注</label>
            <textarea
              v-model="completeModal.notes"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="4"
              placeholder="请输入完成情况说明..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="closeCompleteModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmComplete"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            确认完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppointmentAdmin',
  data() {
    return {
      activeTab: 'measurements',
      statistics: {},
      measurements: {
        orders: [],
        total: 0,
        page: 1,
        totalPages: 1
      },
      installations: {
        orders: [],
        total: 0,
        page: 1,
        totalPages: 1
      },
      measurementFilters: {
        status: 'all',
        date: ''
      },
      installationFilters: {
        status: 'all',
        date: ''
      },
      scheduleModal: {
        show: false,
        type: '',
        order: null,
        scheduledTime: '',
        notes: ''
      },
      completeModal: {
        show: false,
        type: '',
        order: null,
        notes: ''
      }
    }
  },
  mounted() {
    this.loadStatistics()
    this.loadMeasurements()
    this.loadInstallations()
  },
  methods: {
    // 加载统计数据
    async loadStatistics() {
      try {
        const token = localStorage.getItem('admin_token')
        const response = await fetch('/api/appointments/statistics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          this.statistics = result.data
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },
    
    // 加载测量预约列表
    async loadMeasurements(page = 1) {
      try {
        const token = localStorage.getItem('admin_token')
        const params = new URLSearchParams({
          page: page.toString(),
          status: this.measurementFilters.status,
          date: this.measurementFilters.date
        })
        
        const response = await fetch(`/api/appointments/measurements?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          this.measurements = result.data
        }
      } catch (error) {
        console.error('加载测量列表失败:', error)
      }
    },
    
    // 加载安装预约列表
    async loadInstallations(page = 1) {
      try {
        const token = localStorage.getItem('admin_token')
        const params = new URLSearchParams({
          page: page.toString(),
          status: this.installationFilters.status,
          date: this.installationFilters.date
        })
        
        const response = await fetch(`/api/appointments/installations?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          this.installations = result.data
        }
      } catch (error) {
        console.error('加载安装列表失败:', error)
      }
    },
    
    // 重置筛选条件
    resetMeasurementFilters() {
      this.measurementFilters = {
        status: 'all',
        date: ''
      }
      this.loadMeasurements()
    },
    
    resetInstallationFilters() {
      this.installationFilters = {
        status: 'all',
        date: ''
      }
      this.loadInstallations()
    },
    
    // 打开安排预约弹框
    openScheduleModal(type, order) {
      this.scheduleModal = {
        show: true,
        type,
        order,
        scheduledTime: '',
        notes: ''
      }
    },
    
    // 关闭安排预约弹框
    closeScheduleModal() {
      this.scheduleModal = {
        show: false,
        type: '',
        order: null,
        scheduledTime: '',
        notes: ''
      }
    },
    
    // 确认安排预约
    async confirmSchedule() {
      try {
        const token = localStorage.getItem('admin_token')
        const { type, order, scheduledTime, notes } = this.scheduleModal
        
        const response = await fetch(`/api/appointments/${type}s/${order.id}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            scheduledTime,
            notes
          })
        })
        
        if (response.ok) {
          alert('预约安排成功！')
          this.closeScheduleModal()
          this.loadStatistics()
          if (type === 'measurement') {
            this.loadMeasurements()
          } else {
            this.loadInstallations()
          }
        } else {
          const error = await response.json()
          alert(error.message || '安排预约失败')
        }
      } catch (error) {
        console.error('安排预约失败:', error)
        alert('安排预约失败')
      }
    },
    
    // 打开完成任务弹框
    openCompleteModal(type, order) {
      this.completeModal = {
        show: true,
        type,
        order,
        notes: ''
      }
    },
    
    // 关闭完成任务弹框
    closeCompleteModal() {
      this.completeModal = {
        show: false,
        type: '',
        order: null,
        notes: ''
      }
    },
    
    // 确认完成任务
    async confirmComplete() {
      try {
        const token = localStorage.getItem('admin_token')
        const { type, order, notes } = this.completeModal
        
        const response = await fetch(`/api/appointments/${type}s/${order.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            notes
          })
        })
        
        if (response.ok) {
          alert(`${type === 'measurement' ? '测量' : '安装'}完成记录成功！`)
          this.closeCompleteModal()
          this.loadStatistics()
          if (type === 'measurement') {
            this.loadMeasurements()
          } else {
            this.loadInstallations()
          }
        } else {
          const error = await response.json()
          alert(error.message || '完成记录失败')
        }
      } catch (error) {
        console.error('完成记录失败:', error)
        alert('完成记录失败')
      }
    },
    
    // 格式化日期时间
    formatDateTime(datetime) {
      if (!datetime) return '-'
      return new Date(datetime).toLocaleString('zh-CN')
    },
    
    // 获取状态样式
    getStatusClass(status) {
      const statusClasses = {
        'pending': 'bg-gray-100 text-gray-800',
        'measuring': 'bg-blue-100 text-blue-800',
        'measured': 'bg-green-100 text-green-800',
        'producing': 'bg-yellow-100 text-yellow-800',
        'installing': 'bg-purple-100 text-purple-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusTexts = {
        'pending': '待处理',
        'measuring': '测量中',
        'measured': '已测量',
        'producing': '生产中',
        'installing': '安装中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusTexts[status] || status
    }
  }
}
</script> 