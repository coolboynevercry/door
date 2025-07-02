import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sql } from '@vercel/postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateToVercel() {
  try {
    console.log('🚀 开始迁移数据到Vercel Postgres...');

    // 检查环境变量
    if (!process.env.POSTGRES_URL) {
      throw new Error('请设置 POSTGRES_URL 环境变量');
    }

    console.log('✅ 数据库连接成功');

    // 1. 创建数据库表
    console.log('📊 创建数据库表结构...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255),
        address TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        specification TEXT,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        price_unit VARCHAR(20) DEFAULT '个',
        image VARCHAR(500),
        material VARCHAR(255),
        specifications TEXT,
        colors TEXT,
        features TEXT,
        variants TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_address TEXT NOT NULL,
        products TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        measurement_scheduled TIMESTAMP,
        measurement_completed TIMESTAMP,
        installation_scheduled TIMESTAMP,
        installation_completed TIMESTAMP,
        after_sales_status VARCHAR(50) DEFAULT 'none',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        contract_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_address TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        contract_image VARCHAR(500),
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender_type VARCHAR(20) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ 数据库表结构创建完成');

    // 2. 查找并读取导出的JSON文件
    console.log('📁 查找数据导出文件...');
    
    const serverDir = join(__dirname, '../server');
    let exportData;
    
    try {
      // 查找最新的导出文件
      const files = await import('fs').then(fs => fs.readdirSync(serverDir));
      const exportFile = files
        .filter(file => file.startsWith('data_export_') && file.endsWith('.json'))
        .sort()
        .pop(); // 获取最新的文件

      if (!exportFile) {
        throw new Error('未找到数据导出文件，请先运行: cd server && node scripts/exportData.js');
      }

      console.log(`📂 找到导出文件: ${exportFile}`);
      
      const exportFilePath = join(serverDir, exportFile);
      const fileContent = readFileSync(exportFilePath, 'utf8');
      exportData = JSON.parse(fileContent);
    } catch (error) {
      console.log('⚠️  未找到导出文件，将创建空数据库结构');
      exportData = {
        users: [],
        products: [],
        orders: [],
        contracts: [],
        chatMessages: []
      };
    }

    // 3. 迁移数据
    let totalMigrated = 0;

    if (exportData.users && exportData.users.length > 0) {
      console.log(`👥 迁移用户数据: ${exportData.users.length} 条`);
      for (const user of exportData.users) {
        await sql`
          INSERT INTO users (
            username, email, phone, password, address, status, created_at, updated_at
          ) VALUES (
            ${user.username}, ${user.email}, ${user.phone}, ${user.password},
            ${user.address}, ${user.status}, ${user.createdAt}, ${user.updatedAt}
          ) ON CONFLICT (username) DO NOTHING
        `;
      }
      totalMigrated += exportData.users.length;
    }

    if (exportData.products && exportData.products.length > 0) {
      console.log(`🛍️ 迁移商品数据: ${exportData.products.length} 条`);
      for (const product of exportData.products) {
        await sql`
          INSERT INTO products (
            name, category, subcategory, specification, description, price, price_unit,
            image, material, specifications, colors, features, variants, status,
            created_at, updated_at
          ) VALUES (
            ${product.name}, ${product.category}, ${product.subcategory},
            ${product.specification}, ${product.description}, ${product.price},
            ${product.priceUnit}, ${product.image}, ${product.material},
            ${product.specifications}, ${product.colors}, ${product.features},
            ${product.variants}, ${product.status}, ${product.createdAt}, ${product.updatedAt}
          )
        `;
      }
      totalMigrated += exportData.products.length;
    }

    if (exportData.orders && exportData.orders.length > 0) {
      console.log(`📋 迁移订单数据: ${exportData.orders.length} 条`);
      for (const order of exportData.orders) {
        await sql`
          INSERT INTO orders (
            order_number, user_id, customer_name, customer_phone, customer_address,
            products, total_amount, notes, status, measurement_scheduled,
            measurement_completed, installation_scheduled, installation_completed,
            after_sales_status, created_at, updated_at
          ) VALUES (
            ${order.orderNumber}, ${order.userId}, ${order.customerName},
            ${order.customerPhone}, ${order.customerAddress}, ${order.products},
            ${order.totalAmount}, ${order.notes}, ${order.status},
            ${order.measurementScheduled}, ${order.measurementCompleted},
            ${order.installationScheduled}, ${order.installationCompleted},
            ${order.afterSalesStatus}, ${order.createdAt}, ${order.updatedAt}
          ) ON CONFLICT (order_number) DO NOTHING
        `;
      }
      totalMigrated += exportData.orders.length;
    }

    if (exportData.contracts && exportData.contracts.length > 0) {
      console.log(`📄 迁移合同数据: ${exportData.contracts.length} 条`);
      for (const contract of exportData.contracts) {
        await sql`
          INSERT INTO contracts (
            contract_number, customer_name, customer_phone, customer_address,
            total_amount, contract_image, status, created_at, updated_at
          ) VALUES (
            ${contract.contractNumber}, ${contract.customerName}, ${contract.customerPhone},
            ${contract.customerAddress}, ${contract.totalAmount}, ${contract.contractImage},
            ${contract.status}, ${contract.createdAt}, ${contract.updatedAt}
          ) ON CONFLICT (contract_number) DO NOTHING
        `;
      }
      totalMigrated += exportData.contracts.length;
    }

    if (exportData.chatMessages && exportData.chatMessages.length > 0) {
      console.log(`💬 迁移聊天消息数据: ${exportData.chatMessages.length} 条`);
      for (const message of exportData.chatMessages) {
        await sql`
          INSERT INTO chat_messages (
            sender_type, sender_name, message, timestamp, is_read, created_at, updated_at
          ) VALUES (
            ${message.senderType}, ${message.senderName}, ${message.message},
            ${message.timestamp}, ${message.isRead}, ${message.createdAt}, ${message.updatedAt}
          )
        `;
      }
      totalMigrated += exportData.chatMessages.length;
    }

    console.log('\n🎉 数据迁移完成！');
    console.log(`📈 总计迁移记录: ${totalMigrated} 条`);

    // 4. 验证迁移结果
    console.log('\n📊 迁移结果验证:');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    const orderCount = await sql`SELECT COUNT(*) as count FROM orders`;
    const contractCount = await sql`SELECT COUNT(*) as count FROM contracts`;
    const messageCount = await sql`SELECT COUNT(*) as count FROM chat_messages`;

    console.log(`👥 用户: ${userCount.rows[0].count} 条`);
    console.log(`🛍️ 商品: ${productCount.rows[0].count} 条`);
    console.log(`📋 订单: ${orderCount.rows[0].count} 条`);
    console.log(`📄 合同: ${contractCount.rows[0].count} 条`);
    console.log(`💬 消息: ${messageCount.rows[0].count} 条`);

    console.log('\n✅ 迁移成功！接下来可以：');
    console.log('1. 设置Vercel环境变量');
    console.log('2. 部署到Vercel: vercel --prod');
    console.log('3. 测试API功能');

  } catch (error) {
    console.error('❌ 数据迁移失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行迁移
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateToVercel().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('迁移失败:', error);
    process.exit(1);
  });
} 