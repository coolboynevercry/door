const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contractNo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '合同编号'
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联订单ID'
  },
  clientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '乙方公司名称'
  },
  clientContact: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '乙方联系方式'
  },
  clientIdCard: {
    type: DataTypes.STRING(18),
    allowNull: true,
    comment: '乙方身份证号'
  },
  signDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '签订日期'
  },
  installAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '安装地址'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '合同总金额'
  },
  contractImagePath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '合同图片路径'
  }
}, {
  tableName: 'contracts',
  comment: '合同主表',
  indexes: [
    {
      unique: true,
      fields: ['contractNo']
    },
    {
      fields: ['signDate']
    },
    {
      fields: ['clientName']
    },
    {
      fields: ['orderId']
    }
  ]
});

const ContractProduct = sequelize.define('ContractProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contractId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联的合同ID'
  },
  productName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '产品名称'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '单位'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总价'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'contract_products',
  comment: '合同产品明细表',
  indexes: [
    {
      fields: ['contractId']
    }
  ]
});

const ContractNoSequence = sequelize.define('ContractNoSequence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dateStr: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
    comment: '日期字符串(YYYYMMDD)'
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '当日序号'
  }
}, {
  tableName: 'contract_no_sequences',
  comment: '合同编号生成记录表',
  indexes: [
    {
      unique: true,
      fields: ['dateStr']
    }
  ]
});

// 定义关联关系
Contract.hasMany(ContractProduct, {
  foreignKey: 'contractId',
  as: 'products',
  onDelete: 'CASCADE'
});

ContractProduct.belongsTo(Contract, {
  foreignKey: 'contractId',
  as: 'contract'
});

module.exports = {
  Contract,
  ContractProduct,
  ContractNoSequence
}; 