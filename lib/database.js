const { sql } = require('@vercel/postgres');
const { DataTypes, Sequelize } = require('sequelize');

// Sequelize实例（用于ORM）
let sequelize;
let isConnected = false;

// 数据库模型
let User, Product, Order, Contract, ChatMessage;

// 初始化Sequelize连接
function initSequelize() {
  if (!sequelize) {
    sequelize = new Sequelize(process.env.POSTGRES_URL, {
      dialect: 'postgres',
      logging: false, // 生产环境关闭SQL日志
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }
  return sequelize;
}

// 定义数据库模型
function defineModels() {
  const seq = initSequelize();

  // 用户模型
  User = seq.define('User', {
    phone: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    wechatId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // 产品模型
  Product = seq.define('Product', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specifications: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active'
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  // 订单模型
  Order = seq.define('Order', {
    orderNo: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      }
    },
    products: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    installAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  // 聊天消息模型
  ChatMessage = seq.define('ChatMessage', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    senderType: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    needHumanReply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sessionStatus: {
      type: DataTypes.STRING(50),
      defaultValue: 'ai_only'
    },
    lastHumanActivity: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    userPhone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    aiResponseTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'chat_messages',
    timestamps: true
  });

  // 合同模型
  Contract = seq.define('Contract', {
    contractNo: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    clientName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    clientContact: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    clientIdCard: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    signDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    installAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    products: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Order,
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'generated'
    }
  }, {
    tableName: 'contracts',
    timestamps: true
  });

  // 设置关联关系
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Order.hasMany(Contract, { foreignKey: 'orderId', as: 'contracts' });
  Contract.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  
  User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'messages' });
  ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  return { User, Product, Order, Contract, ChatMessage };
}

// 连接数据库并同步模型
async function connectToDatabase() {
  if (isConnected) {
    return { User, Product, Order, Contract, ChatMessage, sequelize };
  }

  try {
    defineModels();
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // 同步模型（不删除现有数据）
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');
    
    isConnected = true;
    return { User, Product, Order, Contract, ChatMessage, sequelize };
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

// 使用Vercel SQL模板字符串（用于原生SQL查询）
const query = sql;

// 数据库健康检查
async function healthCheck() {
  try {
    const result = await sql`SELECT 1 as health`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

// 导出所有函数和模型
module.exports = {
  connectToDatabase,
  healthCheck,
  query,
  sql
}; 