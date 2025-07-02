const { connectToDatabase } = require('../../lib/database');
const { corsHeaders, authenticateToken } = require('../../lib/auth');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 身份验证
  const authResult = await authenticateToken(req);
  if (!authResult.success) {
    return res.status(401).json(authResult);
  }

  try {
    const { Contract, Order } = await connectToDatabase();

    if (req.method === 'POST') {
      // 生成合同
      const {
        clientName,
        clientContact,
        clientIdCard,
        signDate,
        installAddress,
        products,
        orderId
      } = req.body;

      // 验证必填字段
      if (!clientName || !signDate || !installAddress || !products || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请填写完整的合同信息'
        });
      }

      // 验证产品信息
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const missingFields = [];
        
        if (!product.productName) missingFields.push('产品名称');
        if (!product.quantity || product.quantity <= 0) missingFields.push('数量');
        if (!product.unit) missingFields.push('单位');
        if (!product.unitPrice || product.unitPrice <= 0) missingFields.push('单价');
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `第${i + 1}个产品缺少以下信息: ${missingFields.join('、')}`,
            productIndex: i,
            missingFields: missingFields,
            productData: product
          });
        }
      }

      // 计算总金额
      const totalAmount = products.reduce((sum, product) => {
        return sum + (product.quantity * product.unitPrice);
      }, 0);

      // 生成合同号
      const contractNo = 'HT-' + new Date().getFullYear() + 
                         String(new Date().getMonth() + 1).padStart(2, '0') + 
                         String(new Date().getDate()).padStart(2, '0') + 
                         '-' + String(Date.now()).slice(-4);

      // 创建合同记录
      const contract = await Contract.create({
        contractNo,
        clientName,
        clientContact,
        clientIdCard,
        signDate: new Date(signDate),
        installAddress,
        products: JSON.stringify(products),
        totalAmount,
        depositAmount: totalAmount * 0.3, // 定金30%
        orderId,
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: '合同生成成功',
        data: {
          contract,
          contractNo,
          totalAmount,
          depositAmount: totalAmount * 0.3
        }
      });

    } else if (req.method === 'GET') {
      // 获取合同列表
      const { page = 1, limit = 10, orderId } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (orderId) whereClause.orderId = parseInt(orderId);

      const { count, rows } = await Contract.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['orderNo', 'customerName', 'customerPhone']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          contracts: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });

    } else {
      return res.status(405).json({
        success: false,
        message: '方法不允许'
      });
    }
  } catch (error) {
    console.error('合同操作失败:', error);
    res.status(500).json({
      success: false,
      message: '合同操作失败，请稍后重试'
    });
  }
} 