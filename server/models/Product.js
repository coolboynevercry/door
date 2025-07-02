const { v4: uuidv4 } = require('uuid');

// 产品数据模型
class Product {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.price = data.price;
    this.priceUnit = data.priceUnit || '个';
    this.image = data.image;
    this.description = data.description;
    this.category = data.category;
    this.material = data.material;
    this.specifications = data.specifications || [];
    this.features = data.features || [];
    this.colors = data.colors || [];
    this.notes = data.notes;
    this.variants = data.variants || [];
    this.priceRange = data.priceRange;
    this.stock = data.stock || 999; // 库存数量
    this.isActive = data.isActive !== false; // 是否启用
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 验证产品数据
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('产品名称不能为空');
    }
    
    if (!this.price || this.price <= 0) {
      errors.push('产品价格必须大于0');
    }
    
    if (!this.description || this.description.trim() === '') {
      errors.push('产品描述不能为空');
    }
    
    if (!this.category || this.category.trim() === '') {
      errors.push('产品分类不能为空');
    }
    
    if (!this.image || this.image.trim() === '') {
      errors.push('产品图片不能为空');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 转换为API响应格式
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      priceUnit: this.priceUnit,
      image: this.image,
      description: this.description,
      category: this.category,
      material: this.material,
      specifications: this.specifications,
      features: this.features,
      colors: this.colors,
      notes: this.notes,
      variants: this.variants,
      priceRange: this.priceRange,
      stock: this.stock,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // 获取最低价格（用于展示）
  getMinPrice() {
    if (this.variants && this.variants.length > 0) {
      const prices = this.variants.map(v => v.price);
      return Math.min(...prices);
    }
    return this.price;
  }

  // 获取产品的所有可选配置
  getVariantOptions() {
    if (!this.variants || this.variants.length === 0) {
      return null;
    }

    return this.variants.map(variant => ({
      type: variant.type,
      material: variant.material,
      price: variant.price,
      priceUnit: variant.priceUnit,
      available: true // 可以根据库存等条件动态设置
    }));
  }
}

// 模拟产品数据库
class ProductDatabase {
  constructor() {
    this.products = this.initializeProducts();
  }

  // 初始化产品数据
  initializeProducts() {
    return [
      new Product({
        id: 1,
        name: '入户门',
        price: 1700,
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
      }),
      new Product({
        id: 2,
        name: '房间门',
        price: 1000,
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
      }),
      new Product({
        id: 3,
        name: '卫生间门',
        price: 700,
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
      }),
      new Product({
        id: 4,
        name: '厨房推拉门',
        price: 600,
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
      }),
      new Product({
        id: 5,
        name: '阳台推拉门',
        price: 900,
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
      }),
      new Product({
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
      }),
      new Product({
        id: 7,
        name: '推拉窗',
        price: 260,
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
      }),
      new Product({
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
      }),
      new Product({
        id: 9,
        name: '纱窗',
        price: 150,
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
      }),
      new Product({
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
      }),
      new Product({
        id: 11,
        name: '瓷膏',
        price: 100,
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
      })
    ];
  }

  // 获取所有产品
  getAllProducts() {
    return this.products.filter(p => p.isActive).map(p => p.toJSON());
  }

  // 根据ID获取产品
  getProductById(id) {
    const product = this.products.find(p => p.id == id && p.isActive);
    return product ? product.toJSON() : null;
  }

  // 根据分类获取产品
  getProductsByCategory(category) {
    return this.products
      .filter(p => p.category === category && p.isActive)
      .map(p => p.toJSON());
  }

  // 搜索产品
  searchProducts(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.products
      .filter(p => 
        p.isActive && 
        (p.name.toLowerCase().includes(lowerKeyword) ||
         p.description.toLowerCase().includes(lowerKeyword) ||
         p.category.toLowerCase().includes(lowerKeyword))
      )
      .map(p => p.toJSON());
  }

  // 获取产品分类
  getCategories() {
    const categories = [...new Set(this.products.map(p => p.category))];
    return categories.map(category => ({
      name: category,
      count: this.products.filter(p => p.category === category && p.isActive).length
    }));
  }
}

// 创建全局实例
const productDatabase = new ProductDatabase();

module.exports = {
  Product,
  ProductDatabase,
  productDatabase
}; 