// Netlify数据库连接 - 支持多种数据库
const { Sequelize } = require('sequelize');

// 数据库配置
const getDatabaseUrl = () => {
  // 优先级：Supabase > Railway > 其他PostgreSQL
  return process.env.SUPABASE_DB_URL || 
         process.env.RAILWAY_DATABASE_URL || 
         process.env.DATABASE_URL ||
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
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

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
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: 'user'
    },
    phone: Sequelize.STRING,
    address: Sequelize.TEXT
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
    category: Sequelize.STRING,
    price: Sequelize.DECIMAL(10, 2),
    description: Sequelize.TEXT,
    imageUrl: Sequelize.STRING,
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active'
    }
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
      unique: true
    },
    userId: Sequelize.INTEGER,
    products: Sequelize.JSON,
    totalAmount: Sequelize.DECIMAL(10, 2),
    status: {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    },
    customerInfo: Sequelize.JSON
  });

  return { User, Product, Order };
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

module.exports = {
  initDatabase,
  testConnection,
  defineModels,
  initModels,
  getDatabaseUrl
}; 