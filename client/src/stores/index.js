import { defineStore } from 'pinia'

// 产品状态管理
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    legacyProducts: [
      // 门类产品
      {
        id: 1,
        name: '入户门',
        price: 1700, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        description: '高品质防盗门，多种材质和规格可选，安全性能优异',
        category: '入户门',
        features: ['防盗', '耐腐蚀', '多种材质', '可选配锁具'],
        variants: [
          {
            type: '锌合金子母门',
            material: '锌合金',
            price: 3000,
            priceUnit: '个',
            specifications: ['子母门标准尺寸'],
            features: ['防盗', '耐腐蚀', '送指纹锁', '安全性高'],
            notes: '送指纹锁，如果无需默认指纹锁便宜300元'
          },
          {
            type: '锌合金单开门',
            material: '锌合金',
            price: 2500,
            priceUnit: '个',
            specifications: ['单开门标准尺寸'],
            features: ['防盗', '耐腐蚀', '送指纹锁', '经济实用'],
            notes: '送指纹锁，如果无需默认指纹锁便宜300元'
          },
          {
            type: '铝合金卡门板',
            material: '铝合金',
            price: 1700,
            priceUnit: '平方米',
            specifications: ['2cm厚度', '超过规格按平方算'],
            features: ['坚固', '美观', '默认普通锁', '包边计算'],
            notes: '包边有量尺寸算平方米；默认普通锁，如果无需默认普通锁便宜200元'
          }
        ]
      },
      {
        id: 2,
        name: '房间门',
        price: 1000, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        description: '多种材质房间门，适用于各类室内空间',
        category: '房间门',
        features: ['多种材质', '美观', '耐用', '易安装'],
        variants: [
          {
            type: '免漆木门',
            material: '免漆木材',
            price: 1000,
            priceUnit: '个',
            specifications: ['标准房间门尺寸'],
            features: ['环保', '免漆', '经济实用', '易安装']
          },
          {
            type: '烤漆木门',
            material: '烤漆木材',
            price: 1300,
            priceUnit: '个',
            specifications: ['标准房间门尺寸'],
            features: ['高档', '烤漆工艺', '光滑美观', '耐磨']
          },
          {
            type: '铝木门',
            material: '铝木复合',
            price: 1400,
            priceUnit: '个',
            specifications: ['标准房间门尺寸'],
            features: ['复合材料', '坚固', '美观', '隔音']
          },
          {
            type: '全铝门',
            material: '全铝',
            price: 1500,
            priceUnit: '个',
            specifications: ['标准房间门尺寸'],
            features: ['防潮', '防腐', '耐用', '轻量']
          }
        ]
      },
      {
        id: 3,
        name: '卫生间门',
        price: 700, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        description: '卫生间专用门，防潮防水，密封性好',
        category: '卫生间门',
        features: ['防潮', '防水', '易清洁', '密封性好'],
        variants: [
          {
            type: '单包设计',
            material: '防潮材料',
            price: 700,
            priceUnit: '个',
            specifications: ['单包设计'],
            features: ['防潮', '防水', '经济型', '易清洁']
          },
          {
            type: '双包设计',
            material: '防潮材料',
            price: 1000,
            priceUnit: '个',
            specifications: ['双包设计'],
            features: ['防潮', '防水', '密封性好', '高档']
          }
        ]
      },
      {
        id: 4,
        name: '厨房推拉门',
        price: 600, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        description: '厨房专用推拉门，视野开阔，滑动顺畅',
        category: '厨房推拉门',
        features: ['滑动顺畅', '视野开阔', '现代简约', '铝合金材质'],
        variants: [
          {
            type: '标准框 4.5cm',
            material: '铝合金',
            price: 600,
            priceUnit: '平方米',
            specifications: ['4.5cm宽框'],
            features: ['标准边框', '经济实用', '坚固耐用', '易安装']
          },
          {
            type: '极窄框 1.0cm',
            material: '铝合金',
            price: 630,
            priceUnit: '平方米',
            specifications: ['1.0cm极窄框'],
            features: ['极窄边框', '视野开阔', '现代简约', '滑动顺畅']
          }
        ]
      },
      {
        id: 5,
        name: '阳台推拉门',
        price: 900, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        description: '重型阳台推拉门，2.0cm厚材料，坚固耐用',
        category: '阳台推拉门',
        features: ['重型材料', '坚固耐用', '多色可选', '可配纱窗'],
        colors: ['黑色', '咖啡色', '灰色'],
        variants: [
          {
            type: '两轨设计',
            material: '重型铝合金',
            price: 900,
            priceUnit: '平方米',
            specifications: ['两轨设计', '2.0cm厚材料'],
            features: ['重型材料', '两轨', '无纱窗', '简约'],
            notes: '可以做吊轨，但是吊轨容易出问题'
          },
          {
            type: '三轨设计',
            material: '重型铝合金',
            price: 1100,
            priceUnit: '平方米',
            specifications: ['三轨设计', '2.0cm厚材料'],
            features: ['重型材料', '三轨', '配纱窗', '坚固'],
            notes: '可以做吊轨，但是吊轨容易出问题'
          }
        ]
      },
      {
        id: 6,
        name: '折叠门',
        price: 500,
        priceUnit: '平方米',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        description: '多功能折叠门，节省空间，灵活便利',
        category: '折叠门',
        material: '铝合金',
        specifications: ['可折叠设计'],
        features: ['节省空间', '灵活便利', '多功能', '现代设计']
      },
      
      // 窗户类产品
      {
        id: 7,
        name: '推拉窗',
        price: 260, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',
        description: '铝合金推拉窗，多种配置可选，经济实用',
        category: '推拉窗',
        features: ['多种配置', '经济实用', '多色可选', '钢化玻璃'],
        colors: ['黑色', '咖啡色', '白色', '灰色'],
        variants: [
          {
            type: '标配版',
            material: '铝合金',
            price: 260,
            priceUnit: '平方米',
            specifications: ['单轮单层', '白色透明玻璃', '不满2平方按2平方算'],
            features: ['经济实用', '标配', '钢化玻璃不加钱', '多色可选'],
            notes: '换颜色要镀膜+10元/平方；不满2平方按2平方算，520/个'
          },
          {
            type: '选配版',
            material: '铝合金',
            price: 350,
            priceUnit: '平方米',
            specifications: ['双轮双层', '钢化中空玻璃', '不满2平方按2平方算'],
            features: ['隔音隔热', '安全钢化', '双层玻璃', '中空设计'],
            notes: '换颜色要镀膜+10元/平方；中空好处：隔音隔热；钢化玻璃安全性更好'
          }
        ]
      },
      {
        id: 8,
        name: '平开窗',
        price: 350,
        priceUnit: '平方米',
        image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',
        description: '铝合金平开窗，可定制设计，灵活开启',
        category: '平开窗',
        material: '铝合金',
        specifications: ['可出设计图', '开扇价格550/扇'],
        features: ['定制设计', '灵活开启', '多色可选', '节能'],
        colors: ['黑色', '咖啡色', '白色', '灰色'],
        notes: '基础价格为（固定价+350）*平方+开扇价格（550/扇，满3平方可以送一扇）'
      },
      
      // 配套设施
      {
        id: 9,
        name: '纱窗',
        price: 150, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',
        description: '铝合金外壳+不锈钢纱网，防蚊虫透气',
        category: '纱窗',
        features: ['铝合金外壳', '不锈钢纱网', '防蚊虫', '透气'],
        variants: [
          {
            type: '小片纱窗',
            material: '铝合金+不锈钢',
            price: 150,
            priceUnit: '个',
            specifications: ['小片设计', '适用于窗户'],
            features: ['铝合金外壳', '不锈钢纱网', '防蚊虫', '透气'],
            notes: '10个以上可以便宜140/个'
          },
          {
            type: '大片纱窗',
            material: '铝合金+不锈钢',
            price: 300,
            priceUnit: '个',
            specifications: ['大片设计', '适用于推拉门'],
            features: ['铝合金外壳', '不锈钢纱网', '防蚊虫', '透气']
          }
        ]
      },
      {
        id: 10,
        name: '防盗栏',
        price: 150,
        priceUnit: '平方米',
        image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',
        description: '安全防护栏，保护家庭安全',
        category: '防盗栏',
        material: '钢材',
        specifications: ['标准防盗规格'],
        features: ['安全防护', '坚固耐用', '防盗', '美观']
      },
      {
        id: 11,
        name: '瓷膏',
        price: 100, // 最低价格
        priceUnit: '起',
        image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',
        description: '门窗密封专用瓷膏，防水耐候',
        category: '瓷膏',
        features: ['密封', '防水', '耐候', '多规格'],
        variants: [
          {
            type: '3米长',
            material: '密封材料',
            price: 100,
            priceUnit: '条',
            specifications: ['3米长度'],
            features: ['密封', '防水', '耐候', '经济型']
          },
          {
            type: '6米长',
            material: '密封材料',
            price: 190,
            priceUnit: '条',
            specifications: ['6米长度'],
            features: ['密封', '防水', '耐候', '长效'],
            priceRange: '180-200'
          }
        ]
      }
    ],
    categories: ['门', '窗户', '其他配件'],
    // 三级分类结构
    categoryHierarchy: {
      '门': {
        name: '门',
        icon: '🚪',
        subcategories: {
          '入户门': {
            name: '入户门',
            materials: ['锌合金材质', '铝合金材质']
          },
          '房间门': {
            name: '房间门',
            materials: ['免漆木门', '烤漆木门', '铝木门', '全铝门']
          },
          '卫生间门': {
            name: '卫生间门',
            materials: ['单包设计', '双包设计']
          },
          '厨房推拉门': {
            name: '厨房推拉门',
            materials: ['标准框设计', '极窄框设计']
          },
          '阳台推拉门': {
            name: '阳台推拉门',
            materials: ['两轨设计', '三轨设计']
          },
          '折叠门': {
            name: '折叠门',
            materials: ['标准规格']
          }
        }
      },
      '窗户': {
        name: '窗户',
        icon: '🪟',
        subcategories: {
          '推拉窗': {
            name: '推拉窗',
            materials: ['标配版', '选配版']
          },
          '平开窗': {
            name: '平开窗',
            materials: ['标准规格']
          }
        }
      },
      '其他配件': {
        name: '其他配件',
        icon: '🔧',
        subcategories: {
          '纱窗': {
            name: '纱窗',
            materials: ['小片规格', '大片规格']
          },
          '防盗栏': {
            name: '防盗栏',
            materials: ['标准规格']
          },
          '瓷膏': {
            name: '瓷膏',
            materials: ['3米长', '6米长']
          }
        }
      }
    },
    // 分类映射表：将数据库分类映射到前端分类
    categoryMapping: {
      '门': ['入户门', '房间门', '卫生间门', '厨房推拉门', '阳台推拉门', '折叠门'],
      '窗户': ['推拉窗', '平开窗'],
      '其他配件': ['纱窗', '防盗栏', '瓷膏']
    },
    // 材质映射表：将variant类型映射到材质分类
    materialMapping: {
      // 入户门
      '锌合金子母门': '锌合金材质',
      '锌合金单开门': '锌合金材质',
      '铝合金卡门板': '铝合金材质',
      // 房间门
      '免漆木门': '免漆木门',
      '烤漆木门': '烤漆木门',
      '铝木门': '铝木门',
      '全铝门': '全铝门',
      // 卫生间门
      '单包设计': '单包设计',
      '双包设计': '双包设计',
      // 厨房推拉门
      '标准框 4.5cm': '标准框设计',
      '极窄框 1.0cm': '极窄框设计',
      // 阳台推拉门
      '两轨设计': '两轨设计',
      '三轨设计': '三轨设计',
      // 推拉窗
      '标配版': '标配版',
      '选配版': '选配版',
      // 纱窗
      '小片纱窗': '小片规格',
      '大片纱窗': '大片规格',
      // 瓷膏
      '3米长': '3米长',
      '6米长': '6米长'
    }
  }),
  getters: {
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === parseInt(id))
    },
    getProductsByCategory: (state) => (category) => {
      if (!state.categoryMapping[category]) return []
      const dbCategories = state.categoryMapping[category]
      return state.products.filter(product => 
        dbCategories.includes(product.category)
      )
    },
    // 根据二级分类筛选产品
    getProductsBySubcategory: (state) => (subcategory) => {
      return state.products.filter(product => product.category === subcategory)
    },
    // 根据三级分类（材质）筛选产品
    getProductsByMaterial: (state) => (subcategory, material) => {
      const products = state.products.filter(product => product.category === subcategory)
      
      return products.filter(product => {
        // 如果产品有variants，检查是否有匹配的材质
        if (product.variants && product.variants.length > 0) {
          return product.variants.some(variant => {
            const mappedMaterial = state.materialMapping[variant.type]
            return mappedMaterial === material
          })
        } else {
          // 对于没有variants的产品，只要材质是"标准规格"就匹配
          return material === '标准规格'
        }
      })
    },
    // 获取产品的前端分类
    getProductFrontendCategory: (state) => (product) => {
      for (const [frontendCategory, dbCategories] of Object.entries(state.categoryMapping)) {
        if (dbCategories.includes(product.category)) {
          return frontendCategory
        }
      }
      return '其他配件' // 默认分类
    },
    // 获取分类层级结构
    getCategoryHierarchy: (state) => {
      return state.categoryHierarchy
    },
    // 获取某个一级分类下的所有二级分类
    getSubcategories: (state) => (primaryCategory) => {
      return state.categoryHierarchy[primaryCategory]?.subcategories || {}
    },
    // 获取某个二级分类下的所有材质分类
    getMaterials: (state) => (primaryCategory, subcategory) => {
      return state.categoryHierarchy[primaryCategory]?.subcategories[subcategory]?.materials || []
    },
    // 获取某个二级分类的产品数量统计
    getSubcategoryProductCount: (state) => (subcategory) => {
      return state.products.filter(product => product.category === subcategory).length
    },
    // 获取某个材质分类的产品数量统计
    getMaterialProductCount: (state) => (subcategory, material) => {
      const products = state.products.filter(product => product.category === subcategory)
      
      return products.filter(product => {
        if (product.variants && product.variants.length > 0) {
          return product.variants.some(variant => {
            const mappedMaterial = state.materialMapping[variant.type]
            return mappedMaterial === material
          })
        } else {
          return material === '标准规格'
        }
      }).length
    }
  },
  actions: {
    // 从API获取产品数据
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const result = await response.json()
          this.products = result.data || []
        } else {
          throw new Error('获取产品数据失败')
        }
      } catch (error) {
        console.error('获取产品失败:', error)
        this.error = error.message
        // 如果API失败，使用legacy数据作为fallback
        this.products = this.legacyProducts
      } finally {
        this.loading = false
      }
    },
    
    // 刷新产品数据
    async refreshProducts() {
      await this.fetchProducts()
    }
  }
})

// 购物车状态管理
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    cartTotal: (state) => {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    cartItemCount: (state) => {
      return state.items.reduce((count, item) => count + item.quantity, 0)
    }
  },
  actions: {
    addToCart(productToAdd) {
      const { selectedColor, selectedVariant, quantity = 1, ...product } = productToAdd
      
      const existingItem = this.items.find(item => 
        item.id === product.id && 
        item.selectedColor === selectedColor &&
        item.selectedVariant === selectedVariant
      )
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          priceUnit: product.priceUnit || '个',
          image: product.image,
          category: product.category,
          material: product.material,
          selectedColor: selectedColor,
          selectedVariant: selectedVariant,
          quantity: quantity,
          notes: product.notes
        })
      }
    },
    removeFromCart(productId, selectedColor = null, selectedVariant = null) {
      const index = this.items.findIndex(item => 
        item.id === productId && 
        item.selectedColor === selectedColor &&
        item.selectedVariant === selectedVariant
      )
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },
    updateQuantity(productId, selectedColor, selectedVariant, quantity) {
      const item = this.items.find(item => 
        item.id === productId && 
        item.selectedColor === selectedColor &&
        item.selectedVariant === selectedVariant
      )
      if (item) {
        item.quantity = quantity
        if (item.quantity <= 0) {
          this.removeFromCart(productId, selectedColor, selectedVariant)
        }
      }
    },
    clearCart() {
      this.items = []
    }
  }
})

// 订单状态管理
export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null
  }),
  actions: {
    createOrder(orderData) {
      const order = {
        id: Date.now(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      this.orders.push(order)
      this.currentOrder = order
      return order
    },
    updateOrderStatus(orderId, status) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()
      }
    }
  }
})

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    token: null
  }),
  
  getters: {
    getCurrentUser: (state) => state.user,
    isUserLoggedIn: (state) => state.isLoggedIn,
    userPhone: (state) => state.user?.phone,
    userName: (state) => state.user?.name,
    userToken: (state) => state.token
  },
  
  actions: {
    // 设置用户信息和令牌（新方法）
    async setUserInfo(userData, token) {
      this.user = userData
      this.token = token
      this.isLoggedIn = true
      
      // 保存到localStorage
      localStorage.setItem('user_info', JSON.stringify(userData))
      localStorage.setItem('user_token', token)
      
      return true
    },

    // 用户登录
    async login(userData) {
      this.user = userData
      this.isLoggedIn = true
      
      // 保存到localStorage
      localStorage.setItem('user_info', JSON.stringify({
        ...userData,
        loginTime: new Date().toISOString()
      }))
      
      return true
    },

    // 用户注册
    async register(userData) {
      this.user = userData
      this.isLoggedIn = true
      
      // 保存到localStorage
      localStorage.setItem('user_info', JSON.stringify({
        ...userData,
        registerTime: new Date().toISOString(),
        loginTime: new Date().toISOString()
      }))
      
      return true
    },
    
    // 用户登出
    logout() {
      this.user = null
      this.token = null
      this.isLoggedIn = false
      localStorage.removeItem('user_info')
      localStorage.removeItem('user_token')
    },
    
    // 检查登录状态
    checkLoginStatus() {
      const userInfo = localStorage.getItem('user_info')
      const token = localStorage.getItem('user_token')
      
      if (userInfo && token) {
        try {
          const userData = JSON.parse(userInfo)
          
          // 如果有token，直接使用（JWT有自己的过期机制）
          this.user = userData
          this.token = token
          this.isLoggedIn = true
          return true
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.logout()
          return false
        }
      } else if (userInfo) {
        // 兼容旧版本没有token的情况
        try {
          const userData = JSON.parse(userInfo)
          
          // 检查登录是否过期（7天有效期）
          const loginTime = new Date(userData.loginTime)
          const now = new Date()
          const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24)
          
          if (daysDiff < 7) {
            this.user = userData
            this.isLoggedIn = true
            return true
          } else {
            // 登录已过期，清除信息
            this.logout()
            return false
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.logout()
          return false
        }
      }
      return false
    },
    
    // 更新用户信息
    updateUser(userInfo) {
      if (this.user) {
        this.user = { ...this.user, ...userInfo }
        localStorage.setItem('user_info', JSON.stringify(this.user))
      }
    },
    
    // 获取用户信息用于订单
    getUserForOrder() {
      if (this.isLoggedIn && this.user) {
        return {
          customerName: this.user.name,
          customerPhone: this.user.phone
        }
      }
      return null
    }
  }
}) 