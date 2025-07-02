const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const contractService = require('../services/contractService');
const { authenticateToken } = require('../middleware/auth');

/**
 * 生成合同
 * POST /api/contracts/generate
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const {
      client_name,
      client_contact,
      client_id_card,
      sign_date,
      install_address,
      products,
      order_id
    } = req.body;

    // 验证必填字段
    if (!client_name || !sign_date || !install_address || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的合同信息'
      });
    }

    // 验证产品信息
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const missingFields = [];
      
      if (!product.product_name) missingFields.push('产品名称');
      if (!product.quantity || product.quantity <= 0) missingFields.push('数量');
      if (!product.unit) missingFields.push('单位');
      if (!product.unit_price || product.unit_price <= 0) missingFields.push('单价');
      
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

    // 调用合同生成服务
    const result = await contractService.generateContract({
      client_name,
      client_contact,
      client_id_card,
      sign_date,
      install_address,
      products,
      order_id
    });

    if (result.success) {
      res.json({
        success: true,
        message: '合同生成成功',
        data: {
          contract: result.contract,
          contractNo: result.imageResult.contractNo,
          filename: result.imageResult.filename,
          totalAmount: result.imageResult.totalAmount,
          depositAmount: result.imageResult.depositAmount
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('生成合同失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 获取合同列表
 * GET /api/contracts
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, orderId } = req.query;
    
    const result = await contractService.getContracts({
      page: parseInt(page),
      limit: parseInt(limit),
      orderId: orderId ? parseInt(orderId) : undefined
    });

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('获取合同列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 获取合同详情
 * GET /api/contracts/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    
    if (isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        message: '无效的合同ID'
      });
    }

    const result = await contractService.getContract(contractId);

    if (result.success) {
      res.json({
        success: true,
        data: result.contract
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('获取合同详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 下载合同图片
 * GET /api/contracts/download/:filename
 */
router.get('/download/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    
    // 安全检查，防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: '无效的文件名'
      });
    }

    const filePath = path.join(__dirname, '../uploads/contracts', filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '合同文件不存在'
      });
    }

    // 设置下载响应头
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // 发送文件
    res.sendFile(filePath);

  } catch (error) {
    console.error('下载合同文件失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 预览合同图片
 * GET /api/contracts/preview/:filename
 */
router.get('/preview/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // 安全检查
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: '无效的文件名'
      });
    }

    const filePath = path.join(__dirname, '../uploads/contracts', filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '合同文件不存在'
      });
    }

    // 设置图片响应头
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // 发送文件
    res.sendFile(filePath);

  } catch (error) {
    console.error('预览合同文件失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 从订单生成合同
 * POST /api/contracts/generate-from-order/:orderId
 */
router.post('/generate-from-order/:orderId', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const {
      client_name,
      client_contact,
      client_id_card,
      sign_date,
      install_address
    } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: '无效的订单ID'
      });
    }

    // 验证必填字段
    if (!client_name || !sign_date || !install_address) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的合同信息'
      });
    }

    // 获取订单信息
    const { Order } = require('../models/sequelize');
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 将订单商品转换为合同产品格式
    const products = order.items.map(item => ({
      product_name: item.productName || item.name, // 兼容不同的字段名
      quantity: item.quantity,
      unit: item.priceUnit || '套', // 使用订单中的价格单位，默认为套
      unit_price: item.price,
      remark: item.category || item.specification || ''
    }));

    // 生成合同
    const result = await contractService.generateContract({
      client_name,
      client_contact,
      client_id_card,
      sign_date,
      install_address,
      products,
      order_id: orderId
    });

    if (result.success) {
      res.json({
        success: true,
        message: '从订单生成合同成功',
        data: {
          contract: result.contract,
          contractNo: result.imageResult.contractNo,
          filename: result.imageResult.filename,
          totalAmount: result.imageResult.totalAmount,
          depositAmount: result.imageResult.depositAmount
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('从订单生成合同失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 删除合同
 * DELETE /api/contracts/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    
    if (isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        message: '无效的合同ID'
      });
    }

    // 获取合同信息
    const result = await contractService.getContract(contractId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: '合同不存在'
      });
    }

    const contract = result.contract;

    // 删除合同文件
    if (contract.contractImagePath) {
      const filePath = path.join(__dirname, '../uploads/contracts', path.basename(contract.contractImagePath));
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('合同文件已删除:', filePath);
        } catch (fileError) {
          console.error('删除合同文件失败:', fileError);
          // 继续执行，不因为文件删除失败而阻止数据库删除
        }
      }
    }

    // 从数据库删除合同
    const deleteResult = await contractService.deleteContract(contractId);
    
    if (deleteResult.success) {
      res.json({
        success: true,
        message: '合同删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: deleteResult.error
      });
    }

  } catch (error) {
    console.error('删除合同失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 