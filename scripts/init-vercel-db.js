const { connectToDatabase } = require('../lib/database');
const bcrypt = require('bcryptjs');

// 数据库初始化脚本
async function initializeDatabase() {
  try {
    console.log('🚀 开始初始化数据库...');

    // 连接数据库并同步模型
    const { User, Product, Order, Contract, ChatMessage } = await connectToDatabase();
    console.log('✅ 数据库连接和模型同步成功');

    // 创建默认管理员用户
    const adminExists = await User.findOne({ 
      where: { phone: 'admin', isAdmin: true } 
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        phone: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        isAdmin: true
      });
      console.log('✅ 默认管理员账号创建成功');
      console.log('   用户名: admin');
      console.log('   密码: 123456');
    } else {
      console.log('✅ 管理员账号已存在');
    }

    // 插入示例产品数据
    const productCount = await Product.count();
    if (productCount === 0) {
      await Product.bulkCreate([
        {
          name: '铝合金推拉窗',
          category: '推拉窗',
          price: 350.00,
          description: '高质量铝合金材质，隔音效果好',
          specifications: { material: '铝合金', size: '1.2m×1.5m' },
          stock: 100
        },
        {
          name: '断桥铝平开窗',
          category: '平开窗',
          price: 580.00,
          description: '断桥铝材质，保温隔热性能优异',
          specifications: { material: '断桥铝', size: '1.0m×1.2m' },
          stock: 80
        },
        {
          name: '实木复合门',
          category: '入户门',
          price: 1200.00,
          description: '实木复合材质，美观耐用',
          specifications: { material: '实木复合', size: '0.9m×2.1m' },
          stock: 50
        }
      ]);
      console.log('✅ 示例产品数据插入成功');
    } else {
      console.log('✅ 产品数据已存在');
    }

    console.log('🎉 数据库初始化完成！');
    console.log('📋 数据库表结构：');
    console.log('   - users (用户表)');
    console.log('   - products (产品表)');
    console.log('   - orders (订单表)');
    console.log('   - chat_messages (聊天消息表)');
    console.log('   - contracts (合同表)');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ 初始化完成');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ 初始化失败:', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 