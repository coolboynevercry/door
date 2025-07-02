const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '商品名称'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品分类'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  priceUnit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '平方米',
    comment: '价格单位'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '商品图片URL'
  },
  material: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '材料'
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '规格列表'
  },
  colors: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '颜色列表'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '特点列表'
  },
  variants: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '产品变体'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '商品状态'
  }
}, {
  tableName: 'products',
  comment: '商品表'
});

module.exports = Product;
