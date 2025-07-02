const { connectToDatabase } = require('../../lib/database');
const { corsHeaders, authenticateToken } = require('../../lib/auth');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { Order, User } = await connectToDatabase();
    const { id } = req.query;

    if (req.method === 'GET') {
      // 获取订单详情
      const order = await Order.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'phone', 'wechatId']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      res.json({
        success: true,
        data: order,
        message: '获取订单详情成功'
      });

    } else if (req.method === 'PUT') {
      // 更新订单
      const updateData = req.body;
      
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 如果更新产品信息，需要JSON序列化
      if (updateData.products && Array.isArray(updateData.products)) {
        updateData.products = JSON.stringify(updateData.products);
      }

      await order.update({
        ...updateData,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        data: order,
        message: '订单更新成功'
      });

    } else if (req.method === 'PATCH') {
      // 更新订单状态
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: '订单状态不能为空'
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      await order.update({
        status,
        notes,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        data: order,
        message: '订单状态更新成功'
      });

    } else if (req.method === 'DELETE') {
      // 删除订单
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      await order.destroy();

      res.json({
        success: true,
        message: '订单删除成功'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: '方法不允许'
      });
    }
  } catch (error) {
    console.error('订单操作失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
} 