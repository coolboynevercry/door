// 原生pg数据库连接 - 绕过Sequelize依赖问题
const { Client } = require('pg');

// 获取数据库连接URL
const getDatabaseUrl = () => {
  return process.env.NETLIFY_DATABASE_URL || 
         process.env.NEON_DATABASE_URL || 
         process.env.DATABASE_URL ||
         process.env.SUPABASE_DB_URL || 
         process.env.RAILWAY_DATABASE_URL || 
         process.env.POSTGRES_URL;
};

// 创建数据库连接
const createConnection = async () => {
  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    throw new Error('数据库URL未配置');
  }

  const client = new Client({
    connectionString: databaseUrl
  });

  await client.connect();
  return client;
};

// 创建所有数据表
const createTables = async () => {
  const client = await createConnection();
  
  try {
    // 1. 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(11) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        wechat_id VARCHAR(100),
        district VARCHAR(100),
        address TEXT,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active',
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. 创建分类表
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        parent_id INTEGER REFERENCES categories(id),
        sort_order INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. 创建产品表
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        original_price DECIMAL(10,2),
        unit VARCHAR(10) DEFAULT '扇',
        description TEXT,
        specifications JSONB,
        image_url VARCHAR(500),
        images JSONB,
        stock INTEGER DEFAULT 0,
        sold_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 5.0,
        tags JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. 创建订单表
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(11) NOT NULL,
        customer_wechat VARCHAR(100),
        install_address TEXT NOT NULL,
        items JSONB NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        appointment_date TIMESTAMP,
        notes TEXT,
        processed_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. 创建合同表
    await client.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        order_id INTEGER REFERENCES orders(id),
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(11) NOT NULL,
        customer_address TEXT NOT NULL,
        contract_amount DECIMAL(10,2) NOT NULL,
        measurement_date TIMESTAMP,
        installation_date TIMESTAMP,
        contract_content JSONB,
        file_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'draft',
        signed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. 创建聊天消息表
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_id INTEGER REFERENCES users(id),
        user_name VARCHAR(100),
        user_phone VARCHAR(11),
        message TEXT NOT NULL,
        sender VARCHAR(20) NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. 创建预约表
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(11) NOT NULL,
        customer_wechat VARCHAR(100),
        appointment_date TIMESTAMP NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);`);

    console.log('✅ 所有数据表创建成功');
    return true;

  } finally {
    await client.end();
  }
};

// 插入种子数据
const seedData = async () => {
  const client = await createConnection();
  
  try {
    // 1. 插入管理员用户（如果不存在）
    const adminResult = await client.query('SELECT id FROM users WHERE phone = $1', ['admin']);
    if (adminResult.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      await client.query(`
        INSERT INTO users (phone, password, name, role, status) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', hashedPassword, '系统管理员', 'admin', 'active']);
      
      console.log('✅ 管理员账户创建成功');
    }

    // 2. 插入产品分类
    const categoryResult = await client.query('SELECT id FROM categories LIMIT 1');
    if (categoryResult.rows.length === 0) {
      const categories = [
        { name: '推拉门', description: '各种推拉门产品', sort_order: 1 },
        { name: '平开门', description: '各种平开门产品', sort_order: 2 },
        { name: '折叠门', description: '各种折叠门产品', sort_order: 3 },
        { name: '门窗配件', description: '门窗相关配件', sort_order: 4 }
      ];

      for (const category of categories) {
        await client.query(`
          INSERT INTO categories (name, description, sort_order) 
          VALUES ($1, $2, $3)
        `, [category.name, category.description, category.sort_order]);
      }
      
      console.log('✅ 产品分类创建成功');
    }

    // 3. 插入示例产品
    const productResult = await client.query('SELECT id FROM products LIMIT 1');
    if (productResult.rows.length === 0) {
      const products = [
        {
          name: '铝合金推拉门',
          category_id: 1,
          price: 299.00,
          original_price: 399.00,
          description: '高品质铝合金推拉门，隔音效果好',
          stock: 50,
          specifications: JSON.stringify({ 
            material: '铝合金', 
            thickness: '1.2mm', 
            color: ['白色', '黑色', '银色'] 
          }),
          tags: JSON.stringify(['热销', '推荐'])
        },
        {
          name: '木质平开门',
          category_id: 2,
          price: 599.00,
          original_price: 799.00,
          description: '实木平开门，环保健康',
          stock: 30,
          specifications: JSON.stringify({ 
            material: '实木', 
            thickness: '4cm', 
            color: ['原木色', '胡桃色'] 
          }),
          tags: JSON.stringify(['环保', '实木'])
        }
      ];

      for (const product of products) {
        await client.query(`
          INSERT INTO products (name, category_id, price, original_price, description, stock, specifications, tags) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          product.name, product.category_id, product.price, product.original_price,
          product.description, product.stock, product.specifications, product.tags
        ]);
      }
      
      console.log('✅ 示例产品创建成功');
    }

    return true;

  } finally {
    await client.end();
  }
};

// 数据库初始化
const initDatabase = async () => {
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 1. 创建表结构
    await createTables();
    
    // 2. 插入种子数据
    await seedData();
    
    console.log('🎉 数据库初始化完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

// 测试数据库连接
const testConnection = async () => {
  try {
    const client = await createConnection();
    await client.query('SELECT NOW()');
    await client.end();
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
};

// 通用查询函数
const query = async (sql, params = []) => {
  const client = await createConnection();
  
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    await client.end();
  }
};

// 用户相关操作
const userOperations = {
  // 创建用户
  create: async (userData) => {
    const { phone, password, name, wechatId, district, address } = userData;
    const result = await query(`
      INSERT INTO users (phone, password, name, wechat_id, district, address) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, phone, name, wechat_id, district, address, role, status, created_at
    `, [phone, password, name, wechatId, district, address]);
    
    return result.rows[0];
  },

  // 根据手机号查找用户
  findByPhone: async (phone) => {
    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0];
  },

  // 更新最后登录时间
  updateLoginTime: async (userId) => {
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
  }
};

// 产品相关操作
const productOperations = {
  // 获取所有产品
  findAll: async () => {
    const result = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'active' 
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  },

  // 根据ID获取产品
  findById: async (id) => {
    const result = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  }
};

module.exports = {
  getDatabaseUrl,
  createConnection,
  initDatabase,
  testConnection,
  query,
  userOperations,
  productOperations
}; 