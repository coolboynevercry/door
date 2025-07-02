const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

// 数据库初始化脚本
async function initializeDatabase() {
  try {
    console.log('🚀 开始初始化数据库...');

    // 创建用户表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(100) NOT NULL,
        "wechatId" VARCHAR(100),
        district VARCHAR(100),
        address TEXT,
        email VARCHAR(255),
        "isAdmin" BOOLEAN DEFAULT FALSE,
        "totalOrders" INTEGER DEFAULT 0,
        "totalAmount" DECIMAL(10,2) DEFAULT 0,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ 用户表创建成功');

    // 创建产品表
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        specifications JSONB,
        images JSONB,
        stock INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ 产品表创建成功');

    // 创建订单表
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "orderNo" VARCHAR(50) UNIQUE NOT NULL,
        "userId" INTEGER REFERENCES users(id),
        products JSONB NOT NULL,
        "totalAmount" DECIMAL(10,2) NOT NULL,
        "installAddress" TEXT,
        "customerName" VARCHAR(100) NOT NULL,
        "customerPhone" VARCHAR(20) NOT NULL,
        "appointmentDate" TIMESTAMP,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ 订单表创建成功');

    // 创建聊天消息表
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id),
        "sessionId" VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        "senderType" VARCHAR(20) NOT NULL,
        "needHumanReply" BOOLEAN DEFAULT FALSE,
        "sessionStatus" VARCHAR(50) DEFAULT 'ai_only',
        "lastHumanActivity" TIMESTAMP,
        "userName" VARCHAR(100),
        "userPhone" VARCHAR(20),
        "aiResponseTime" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ 聊天消息表创建成功');

    // 创建合同表
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        "contractNo" VARCHAR(50) UNIQUE NOT NULL,
        "clientName" VARCHAR(100) NOT NULL,
        "clientContact" VARCHAR(20),
        "clientIdCard" VARCHAR(50),
        "signDate" DATE NOT NULL,
        "installAddress" TEXT NOT NULL,
        products JSONB NOT NULL,
        "totalAmount" DECIMAL(10,2) NOT NULL,
        "depositAmount" DECIMAL(10,2) NOT NULL,
        "orderId" INTEGER REFERENCES orders(id),
        status VARCHAR(20) DEFAULT 'generated',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ 合同表创建成功');

    // 创建默认管理员用户
    const adminExists = await sql`
      SELECT id FROM users WHERE phone = 'admin' AND "isAdmin" = true
    `;

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await sql`
        INSERT INTO users (phone, password, name, "isAdmin", "createdAt", "updatedAt")
        VALUES ('admin', ${hashedPassword}, '系统管理员', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      console.log('✅ 默认管理员账号创建成功');
      console.log('   用户名: admin');
      console.log('   密码: 123456');
    } else {
      console.log('✅ 管理员账号已存在');
    }

    // 插入示例产品数据
    const productExists = await sql`SELECT id FROM products LIMIT 1`;
    if (productExists.rows.length === 0) {
      await sql`
        INSERT INTO products (name, category, price, description, specifications, stock, "createdAt", "updatedAt")
        VALUES 
        ('铝合金推拉窗', '推拉窗', 350.00, '高质量铝合金材质，隔音效果好', '{"material": "铝合金", "size": "1.2m×1.5m"}', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('断桥铝平开窗', '平开窗', 580.00, '断桥铝材质，保温隔热性能优异', '{"material": "断桥铝", "size": "1.0m×1.2m"}', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('实木复合门', '入户门', 1200.00, '实木复合材质，美观耐用', '{"material": "实木复合", "size": "0.9m×2.1m"}', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      console.log('✅ 示例产品数据插入成功');
    }

    console.log('🎉 数据库初始化完成！');
    console.log('📋 数据库表结构：');
    console.log('   - users (用户表)');
    console.log('   - products (产品表)');
    console.log('   - orders (订单表)');
    console.log('   - chat_messages (聊天消息表)');
    console.log('   - contracts (合同表)');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ 初始化完成');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ 初始化失败:', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 