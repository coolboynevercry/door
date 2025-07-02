const { Sequelize } = require('sequelize');
require('dotenv').config();

// 生产环境数据库配置（用于Vercel部署）
const sequelize = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: false
      }
    });

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 使用PostgreSQL生产数据库');
    } else {
      console.log('💻 使用SQLite开发数据库');
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 