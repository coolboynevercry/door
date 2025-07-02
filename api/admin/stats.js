import { adminApiHandler, createApiResponse } from '../../lib/auth.js';
import { sql } from '../../lib/database.js';

export default adminApiHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return createApiResponse(false, null, '方法不允许', 405);
  }

  try {
    // 获取各种统计数据
    const stats = await Promise.all([
      // 商品总数
      sql`SELECT COUNT(*) as count FROM products WHERE status = 'active'`,
      
      // 订单总数
      sql`SELECT COUNT(*) as count FROM orders`,
      
      // 待处理订单数
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`,
      
      // 今日新增订单
      sql`SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE`,
      
      // 用户总数
      sql`SELECT COUNT(*) as count FROM users`,
      
      // 活跃用户数
      sql`SELECT COUNT(*) as count FROM users WHERE status = 'active'`,
      
      // 合同总数
      sql`SELECT COUNT(*) as count FROM contracts`,
      
      // 聊天消息数
      sql`SELECT COUNT(*) as count FROM chat_messages`
    ]);

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      todayOrders,
      totalUsers,
      activeUsers,
      totalContracts,
      totalMessages
    ] = stats.map(result => parseInt(result.rows[0].count));

    // 获取订单状态分布
    const orderStatusResult = await sql`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `;
    
    const orderStatusDistribution = orderStatusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    // 获取近7天订单趋势
    const orderTrendResult = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const orderTrend = orderTrendResult.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count)
    }));

    const statsData = {
      overview: {
        totalProducts,
        totalOrders,
        pendingOrders,
        todayOrders,
        totalUsers,
        activeUsers,
        totalContracts,
        totalMessages
      },
      orderStatusDistribution,
      orderTrend,
      lastUpdated: new Date().toISOString()
    };

    return createApiResponse(true, statsData, '统计数据获取成功');

  } catch (error) {
    console.error('Admin stats error:', error);
    return createApiResponse(false, null, '获取统计数据失败', 500);
  }
}); 