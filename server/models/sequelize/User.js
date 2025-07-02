const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号码'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '登录密码'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '用户姓名'
  },
  wechatId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '微信号'
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '所在区域'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '详细地址'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱地址'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active',
    comment: '用户状态'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总订单数'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '总消费金额'
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否为管理员'
  }
}, {
  tableName: 'users',
  comment: '用户表'
});

module.exports = User; 