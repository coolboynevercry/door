const { sequelize } = require('../../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const ChatMessage = require('./ChatMessage');
const { Contract, ContractProduct, ContractNoSequence } = require('./Contract');

// 定义模型关联关系
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
});

Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 订单和合同的关联关系
Order.hasOne(Contract, {
  foreignKey: 'orderId',
  as: 'contract'
});

Contract.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// 同步数据库
const syncDatabase = async (force = false) => {
  try {
    console.log('开始同步数据库...');
    
    // 使用更安全的同步方式
    if (force) {
      await sequelize.sync({ force: true });
    } else {
      // 仅在表不存在时创建表，不修改现有表结构
      await sequelize.sync();
    }
    
    console.log('✅ 数据库同步完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  ChatMessage,
  Contract,
  ContractProduct,
  ContractNoSequence,
  syncDatabase
};
