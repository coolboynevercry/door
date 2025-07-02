const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// 从环境变量获取数据库连接
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

// 定义模型（PostgreSQL版本）
const defineModels = () => {
  // 用户模型
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // 商品模型
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specification: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    priceUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '个'
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    material: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    colors: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    features: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    variants: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  // 订单模型
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    products: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'measuring', 'measured', 'production', 'ready', 'installing', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    measurementScheduled: {
      type: DataTypes.DATE,
      allowNull: true
    },
    measurementCompleted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    installationScheduled: {
      type: DataTypes.DATE,
      allowNull: true
    },
    installationCompleted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    afterSalesStatus: {
      type: DataTypes.ENUM('none', 'requested', 'processing', 'resolved'),
      defaultValue: 'none'
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  // 合同模型
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contractNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    contractImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
      defaultValue: 'draft'
    }
  }, {
    tableName: 'contracts',
    timestamps: true
  });

  // 聊天消息模型
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderType: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'chat_messages',
    timestamps: true
  });

  return { User, Product, Order, Contract, ChatMessage };
};

// 导入数据函数
async function importData() {
  try {
    console.log('🚀 开始数据导入...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 定义模型
    const models = defineModels();
    
    // 同步数据库结构
    console.log('📊 创建数据库表...');
    await sequelize.sync({ force: true }); // 注意：这会删除现有数据
    console.log('✅ 数据库表创建完成');
    
    // 查找导出的JSON文件
    const serverDir = path.join(__dirname, '../');
    const files = fs.readdirSync(serverDir);
    const exportFile = files.find(file => file.startsWith('data_export_') && file.endsWith('.json'));
    
    if (!exportFile) {
      throw new Error('未找到数据导出文件，请先运行 node scripts/exportData.js');
    }
    
    console.log(`📁 找到导出文件: ${exportFile}`);
    
    // 读取导出数据
    const exportFilePath = path.join(serverDir, exportFile);
    const exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'));
    
    // 导入用户数据
    if (exportData.users && exportData.users.length > 0) {
      console.log(`👥 导入用户数据: ${exportData.users.length} 条`);
      for (const user of exportData.users) {
        await models.User.create({
          username: user.username,
          email: user.email,
          phone: user.phone,
          password: user.password,
          address: user.address,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      }
      console.log('✅ 用户数据导入完成');
    }
    
    // 导入商品数据
    if (exportData.products && exportData.products.length > 0) {
      console.log(`🛍️ 导入商品数据: ${exportData.products.length} 条`);
      for (const product of exportData.products) {
        await models.Product.create({
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          specification: product.specification,
          description: product.description,
          price: product.price,
          priceUnit: product.priceUnit,
          image: product.image,
          material: product.material,
          specifications: product.specifications,
          colors: product.colors,
          features: product.features,
          variants: product.variants,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        });
      }
      console.log('✅ 商品数据导入完成');
    }
    
    // 导入订单数据
    if (exportData.orders && exportData.orders.length > 0) {
      console.log(`📋 导入订单数据: ${exportData.orders.length} 条`);
      for (const order of exportData.orders) {
        await models.Order.create({
          orderNumber: order.orderNumber,
          userId: order.userId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          products: order.products,
          totalAmount: order.totalAmount,
          notes: order.notes,
          status: order.status,
          measurementScheduled: order.measurementScheduled,
          measurementCompleted: order.measurementCompleted,
          installationScheduled: order.installationScheduled,
          installationCompleted: order.installationCompleted,
          afterSalesStatus: order.afterSalesStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        });
      }
      console.log('✅ 订单数据导入完成');
    }
    
    // 导入合同数据
    if (exportData.contracts && exportData.contracts.length > 0) {
      console.log(`📄 导入合同数据: ${exportData.contracts.length} 条`);
      for (const contract of exportData.contracts) {
        await models.Contract.create({
          contractNumber: contract.contractNumber,
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          customerAddress: contract.customerAddress,
          totalAmount: contract.totalAmount,
          contractImage: contract.contractImage,
          status: contract.status,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt
        });
      }
      console.log('✅ 合同数据导入完成');
    }
    
    // 导入聊天消息数据
    if (exportData.chatMessages && exportData.chatMessages.length > 0) {
      console.log(`💬 导入聊天消息数据: ${exportData.chatMessages.length} 条`);
      for (const message of exportData.chatMessages) {
        await models.ChatMessage.create({
          senderType: message.senderType,
          senderName: message.senderName,
          message: message.message,
          timestamp: message.timestamp,
          isRead: message.isRead,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        });
      }
      console.log('✅ 聊天消息数据导入完成');
    }
    
    // 统计导入结果
    const userCount = await models.User.count();
    const productCount = await models.Product.count();
    const orderCount = await models.Order.count();
    const contractCount = await models.Contract.count();
    const messageCount = await models.ChatMessage.count();
    
    console.log('\n📊 数据导入统计:');
    console.log(`👥 用户: ${userCount} 条`);
    console.log(`🛍️ 商品: ${productCount} 条`);
    console.log(`📋 订单: ${orderCount} 条`);
    console.log(`📄 合同: ${contractCount} 条`);
    console.log(`💬 消息: ${messageCount} 条`);
    console.log(`📈 总计: ${userCount + productCount + orderCount + contractCount + messageCount} 条`);
    
    console.log('\n🎉 数据导入完成！');
    console.log('📝 请确保：');
    console.log('1. 检查数据完整性');
    console.log('2. 测试应用功能');
    console.log('3. 更新文件上传路径');
    
  } catch (error) {
    console.error('❌ 数据导入失败:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ 请设置 DATABASE_URL 环境变量');
    console.error('例如: DATABASE_URL=postgresql://user:pass@host:port/db node scripts/importData.js');
    process.exit(1);
  }
  
  importData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('导入失败:', error);
    process.exit(1);
  });
}

module.exports = { importData }; 