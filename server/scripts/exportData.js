const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

// 导出所有数据到JSON文件
async function exportData() {
  try {
    console.log('🚀 开始导出数据...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    const exportData = {};
    
    // 导出用户数据
    try {
      const users = await sequelize.query('SELECT * FROM users', {
        type: sequelize.QueryTypes.SELECT
      });
      exportData.users = users;
      console.log(`📊 导出用户数据: ${users.length} 条记录`);
    } catch (error) {
      console.log('⚠️  用户表不存在或为空');
      exportData.users = [];
    }
    
    // 导出商品数据
    try {
      const products = await sequelize.query('SELECT * FROM products', {
        type: sequelize.QueryTypes.SELECT
      });
      exportData.products = products;
      console.log(`📊 导出商品数据: ${products.length} 条记录`);
    } catch (error) {
      console.log('⚠️  商品表不存在或为空');
      exportData.products = [];
    }
    
    // 导出订单数据
    try {
      const orders = await sequelize.query('SELECT * FROM orders', {
        type: sequelize.QueryTypes.SELECT
      });
      exportData.orders = orders;
      console.log(`📊 导出订单数据: ${orders.length} 条记录`);
    } catch (error) {
      console.log('⚠️  订单表不存在或为空');
      exportData.orders = [];
    }
    
    // 导出合同数据
    try {
      const contracts = await sequelize.query('SELECT * FROM contracts', {
        type: sequelize.QueryTypes.SELECT
      });
      exportData.contracts = contracts;
      console.log(`📊 导出合同数据: ${contracts.length} 条记录`);
    } catch (error) {
      console.log('⚠️  合同表不存在或为空');
      exportData.contracts = [];
    }
    
    // 导出合同产品明细数据
    try {
      const contractItems = await sequelize.query('SELECT * FROM contract_items', {
        type: sequelize.QueryTypes.SELECT
      });
      exportData.contractItems = contractItems;
      console.log(`📊 导出合同明细数据: ${contractItems.length} 条记录`);
    } catch (error) {
      console.log('⚠️  合同明细表不存在或为空');
      exportData.contractItems = [];
    }
    
    // 导出聊天消息数据
    try {
      const chatMessages = await sequelize.query('SELECT * FROM chat_messages', {
        type: sequelize.QueryTypes.SELECT
      });
      exportData.chatMessages = chatMessages;
      console.log(`📊 导出聊天消息数据: ${chatMessages.length} 条记录`);
    } catch (error) {
      console.log('⚠️  聊天消息表不存在或为空');
      exportData.chatMessages = [];
    }
    
    // 保存到文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data_export_${timestamp}.json`;
    const filepath = path.join(__dirname, '../', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ 数据导出完成！`);
    console.log(`📁 文件保存位置: ${filepath}`);
    
    // 生成数据统计
    const totalRecords = Object.values(exportData).reduce((sum, data) => sum + data.length, 0);
    console.log(`📈 总计导出记录: ${totalRecords} 条`);
    
    // 生成导入脚本提示
    console.log('\n🔧 下一步操作:');
    console.log('1. 在Vercel中创建PostgreSQL数据库');
    console.log('2. 获取数据库连接字符串');
    console.log('3. 运行数据导入脚本: node scripts/importData.js');
    console.log('4. 更新环境变量和配置文件');
    
  } catch (error) {
    console.error('❌ 导出数据失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  exportData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('导出失败:', error);
    process.exit(1);
  });
}

module.exports = { exportData }; 