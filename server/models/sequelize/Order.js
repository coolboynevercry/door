const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '用户ID'
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '客户姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系电话'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱地址'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '地址'
  },
  // 测量相关
  measurementScheduled: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '测量预约时间'
  },
  measurementCompleted: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '测量完成时间'
  },
  // 安装相关
  installationScheduled: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '安装预约时间'
  },
  installationCompleted: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '安装完成时间'
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '订单商品列表'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总金额'
  },
  status: {
    type: DataTypes.ENUM('pending', 'measuring', 'measured', 'producing', 'installing', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: '订单状态：待处理/测量中/已测量/生产中/安装中/已完成/已取消'
  },
  // 售后状态
  afterSalesStatus: {
    type: DataTypes.ENUM('none', 'requested', 'processing', 'resolved'),
    defaultValue: 'none',
    comment: '售后状态：无/已申请/处理中/已解决'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'orders',
  comment: '订单表'
});

module.exports = Order;
