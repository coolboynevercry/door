const { sequelize, Product, Order, syncDatabase } = require('../models/sequelize');
const { testConnection } = require('../config/database');
require('dotenv').config();

// 示例商品数据
const sampleProducts = [
  {
    name: '高端铝合金入户门',
    category: '入户门',
    description: '采用优质铝合金材料，表面经过阳极氧化处理，具有优异的耐腐蚀性和装饰性。',
    price: 1200.00,
    priceUnit: '平方米',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    material: '6063-T5铝型材',
    specifications: ['800x2000mm', '900x2100mm', '1000x2200mm'],
    colors: ['白色', '香槟色', '古铜色', '黑色'],
    features: ['防盗', '静音', '保温', '美观'],
    variants: [
      {
        type: '标准型',
        material: '6063-T5铝型材',
        price: 1200,
        priceUnit: '平方米',
        features: ['防盗', '静音', '保温'],
        notes: '适合一般家庭使用'
      },
      {
        type: '豪华型',
        material: '6063-T6铝型材',
        price: 1500,
        priceUnit: '平方米',
        features: ['防盗', '静音', '保温', '智能锁'],
        notes: '配备智能锁系统'
      }
    ]
  },
  {
    name: '安全防盗栏',
    category: '防盗栏',
    description: '采用高强度钢材制作，表面热镀锌处理，有效防止生锈，确保长期使用。',
    price: 280.00,
    priceUnit: '平方米',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    material: 'Q235钢材',
    specifications: ['1200x1500mm', '1500x1500mm', '2000x1500mm'],
    colors: ['黑色', '白色', '灰色'],
    features: ['防盗', '美观', '耐用']
  },
  {
    name: '隔音推拉窗',
    category: '推拉窗',
    description: '双层中空玻璃设计，有效隔音降噪，铝合金边框，密封性能优异。',
    price: 450.00,
    priceUnit: '平方米',
    image: 'https://images.unsplash.com/photo-1562113530-57ba79cea612?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    material: '断桥铝型材',
    specifications: ['1200x1200mm', '1500x1200mm', '1800x1200mm'],
    colors: ['白色', '灰色', '香槟色'],
    features: ['隔音', '保温', '密封性好']
  }
];

// 初始化数据库
const initDatabase = async () => {
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 测试连接
    await testConnection();
    
    // 同步数据库结构
    console.log('📋 同步数据库结构...');
    await syncDatabase(false); // false表示不强制重建表
    
    // 检查是否已有数据
    const productCount = await Product.count();
    
    if (productCount === 0) {
      console.log('📦 插入示例商品数据...');
      await Product.bulkCreate(sampleProducts);
      console.log(`✅ 已插入 ${sampleProducts.length} 个示例商品`);
    } else {
      console.log(`ℹ️  数据库中已存在 ${productCount} 个商品，跳过插入示例数据`);
    }
    
    console.log('🎉 数据库初始化完成！');
    
    // 显示统计信息
    const finalProductCount = await Product.count();
    const finalOrderCount = await Order.count();
    console.log(`📊 当前数据库统计:`);
    console.log(`   - 商品数量: ${finalProductCount}`);
    console.log(`   - 订单数量: ${finalOrderCount}`);
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase().then(() => {
    console.log('✨ 初始化完成，服务器可以启动了！');
    process.exit(0);
  });
}

module.exports = { initDatabase };
