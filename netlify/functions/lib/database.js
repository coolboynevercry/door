// Netlify数据库连接 - 支持多种数据库
const { Sequelize } = require('sequelize');

// 数据库配置
const getDatabaseUrl = () => {
  // 优先级：Netlify Neon > 其他 Neon > Supabase > Railway > 其他PostgreSQL
  return process.env.NETLIFY_DATABASE_URL || 
         process.env.NEON_DATABASE_URL || 
         process.env.DATABASE_URL ||
         process.env.SUPABASE_DB_URL || 
         process.env.RAILWAY_DATABASE_URL || 
         process.env.POSTGRES_URL;
};

// 创建Sequelize实例
let sequelize = null;

const initDatabase = () => {
  if (sequelize) return sequelize;

  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    console.warn('⚠️ 数据库URL未配置，使用内存模式');
    return null;
  }

  try {
    // 检查是否是Neon数据库连接
    const isNeonDb = databaseUrl.includes('neon.tech');
    
    const config = {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    };

    // 根据数据库类型配置SSL
    if (isNeonDb) {
      // Neon数据库配置 - 连接字符串已包含SSL参数，无需额外配置
      // Neon连接字符串包含?sslmode=require，Sequelize会自动处理
    } else {
      // 其他数据库配置
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    }

    sequelize = new Sequelize(databaseUrl, config);

    console.log('✅ 数据库连接初始化成功');
    return sequelize;

  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return null;
  }
};

// 测试数据库连接
const testConnection = async () => {
  const db = initDatabase();
  if (!db) return false;

  try {
    await db.authenticate();
    console.log('✅ 数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    return false;
  }
};

// 定义数据模型
const defineModels = (sequelize) => {
  if (!sequelize) return {};

  // 用户模型
  const User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phone: {
      type: Sequelize.STRING(11),
      unique: true,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [11, 11]
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    wechatId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    district: {
      type: Sequelize.STRING,
      allowNull: true
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: 'user'
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active'
    },
    lastLoginAt: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['phone'] },
      { fields: ['status'] }
    ]
  });

  // 商品分类模型
  const Category = sequelize.define('Category', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    parentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    sortOrder: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active'
    }
  }, {
    tableName: 'categories',
    timestamps: true
  });

  // 商品模型
  const Product = sequelize.define('Product', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    originalPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    },
    unit: {
      type: Sequelize.STRING,
      defaultValue: '扇'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    specifications: {
      type: Sequelize.JSON,
      allowNull: true
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    images: {
      type: Sequelize.JSON,
      allowNull: true
    },
    stock: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    soldCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 5.0
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['status'] },
      { fields: ['price'] }
    ]
  });

  // 订单模型
  const Order = sequelize.define('Order', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    customerName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    customerPhone: {
      type: Sequelize.STRING,
      allowNull: false
    },
    customerWechat: {
      type: Sequelize.STRING,
      allowNull: true
    },
    installAddress: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    items: {
      type: Sequelize.JSON,
      allowNull: false
    },
    totalAmount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    },
    appointmentDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    processedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    completedAt: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['orderNumber'] }
    ]
  });

  // 合同模型
  const Contract = sequelize.define('Contract', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contractNumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    customerName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    customerPhone: {
      type: Sequelize.STRING,
      allowNull: false
    },
    projectAddress: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    contractAmount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    depositAmount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    finalAmount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    measurementDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    installationDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    contractContent: {
      type: Sequelize.JSON,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'draft'
    },
    signedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    tableName: 'contracts',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['status'] },
      { fields: ['contractNumber'] }
    ]
  });

  // 聊天消息模型
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    userPhone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    sender: {
      type: Sequelize.STRING,
      allowNull: false
    },
    messageType: {
      type: Sequelize.STRING,
      defaultValue: 'text'
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [
      { fields: ['sessionId'] },
      { fields: ['userId'] },
      { fields: ['sender'] }
    ]
  });

  // 预约模型
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    customerPhone: {
      type: Sequelize.STRING,
      allowNull: false
    },
    appointmentDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    appointmentTime: {
      type: Sequelize.STRING,
      allowNull: false
    },
    serviceType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'appointments',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['appointmentDate'] }
    ]
  });

  // 定义关联关系
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Order.hasOne(Contract, { foreignKey: 'orderId', as: 'contract' });
  Contract.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'messages' });
  ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  return { 
    User, 
    Category, 
    Product, 
    Order, 
    Contract, 
    ChatMessage, 
    Appointment 
  };
};

// 初始化数据库和模型
const initModels = async () => {
  const db = initDatabase();
  if (!db) return { db: null, models: {} };

  const models = defineModels(db);
  
  try {
    // 同步数据库（生产环境使用alter模式）
    await db.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ 数据模型同步成功');
  } catch (error) {
    console.error('❌ 数据模型同步失败:', error);
  }

  return { db, models };
};

// 种子数据初始化
const seedDatabase = async () => {
  const { db, models } = await initModels();
  if (!db) return false;

  try {
    const { Category, Product } = models;

    // 检查是否已有数据
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log('✅ 数据库已有种子数据，跳过初始化');
      return true;
    }

    // 创建分类
    const categories = await Category.bulkCreate([
      {
        name: '推拉门窗',
        description: '高品质推拉式门窗，节省空间，开启方便',
        sortOrder: 1
      },
      {
        name: '平开门窗',
        description: '传统平开式门窗，密封性好，隔音效果佳',
        sortOrder: 2
      },
      {
        name: '折叠门窗',
        description: '可折叠式门窗，开启面积大，通风效果好',
        sortOrder: 3
      },
      {
        name: '百叶窗',
        description: '可调节角度的百叶窗，控制光线和隐私',
        sortOrder: 4
      }
    ]);

    // 创建产品
    await Product.bulkCreate([
      {
        name: '铝合金推拉窗',
        categoryId: categories[0].id,
        price: 580.00,
        originalPrice: 680.00,
        description: '优质铝合金材质，双层中空玻璃，隔音隔热效果好',
        specifications: {
          material: '铝合金',
          glass: '双层中空',
          thickness: '1.4mm',
          color: '白色/灰色可选'
        },
        tags: ['热销', '隔音', '节能']
      },
      {
        name: '塑钢推拉门',
        categoryId: categories[0].id,
        price: 450.00,
        originalPrice: 520.00,
        description: '环保塑钢材质，防腐耐用，性价比高',
        specifications: {
          material: '塑钢',
          glass: '单层钢化',
          thickness: '1.2mm',
          color: '白色'
        },
        tags: ['环保', '经济型']
      },
      {
        name: '断桥铝平开窗',
        categoryId: categories[1].id,
        price: 720.00,
        originalPrice: 850.00,
        description: '断桥铝合金，保温隔热性能优异，适合各种气候',
        specifications: {
          material: '断桥铝',
          glass: '三层中空',
          thickness: '1.6mm',
          color: '多色可选'
        },
        tags: ['高端', '保温', '隔热']
      },
      {
        name: '铝合金折叠门',
        categoryId: categories[2].id,
        price: 950.00,
        description: '可折叠设计，最大化开启面积，适合阳台和庭院',
        specifications: {
          material: '铝合金',
          glass: '钢化玻璃',
          thickness: '1.5mm',
          folds: '4-6折可选'
        },
        tags: ['大开启', '美观']
      }
    ]);

    console.log('✅ 种子数据初始化成功');
    return true;
  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    return false;
  }
};

module.exports = {
  initDatabase,
  testConnection,
  defineModels,
  initModels,
  seedDatabase,
  getDatabaseUrl
}; 