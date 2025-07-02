const { connectToDatabase } = require('../../lib/database');
const { corsHeaders, authenticateUser } = require('../../lib/auth');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 身份验证
  const authResult = await authenticateUser(req);
  if (!authResult.success) {
    return res.status(401).json(authResult);
  }

  try {
    const { User, Order } = await connectToDatabase();

    if (req.method === 'GET') {
      // 获取用户信息
      const user = await User.findByPk(authResult.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          wechatId: user.wechatId,
          district: user.district,
          address: user.address,
          email: user.email,
          totalOrders: user.totalOrders,
          totalAmount: user.totalAmount,
          lastLoginAt: user.lastLoginAt
        }
      });
    } else if (req.method === 'PUT') {
      // 更新用户信息
      const { name, wechatId, district, address, email } = req.body;
      
      const user = await User.findByPk(authResult.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      await user.update({
        name,
        wechatId,
        district,
        address,
        email
      });

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          wechatId: user.wechatId,
          district: user.district,
          address: user.address,
          email: user.email
        }
      });
    } else {
      return res.status(405).json({
        success: false,
        message: '方法不允许'
      });
    }
  } catch (error) {
    console.error('用户信息操作失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
} 