const express = require('express');
const { orderDatabase } = require('../models/Order');

const router = express.Router();

// 创建新订单
router.post('/', (req, res) => {
  try {
    const orderData = req.body;
    
    // 验证必要字段
    if (!orderData.customerInfo) {
      return res.status(400).json({
        success: false,
        message: '客户信息不能为空'
      });
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '订单商品不能为空'
      });
    }
    
    const order = orderDatabase.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(400).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
});

// 获取所有订单
router.get('/', (req, res) => {
  try {
    const options = {
      status: req.query.status,
      phone: req.query.phone,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      page: req.query.page ? parseInt(req.query.page) : null,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const orders = orderDatabase.getAllOrders(options);
    
    res.json({
      success: true,
      data: orders,
      total: orders.length,
      pagination: options.page && options.limit ? {
        page: options.page,
        limit: options.limit,
        hasMore: orders.length === options.limit
      } : null,
      message: '获取订单列表成功'
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
      error: error.message
    });
  }
});

// 根据ID获取单个订单
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = orderDatabase.getOrderById(id);
    
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
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    });
  }
});

// 根据订单号获取订单
router.get('/orderNo/:orderNo', (req, res) => {
  try {
    const { orderNo } = req.params;
    const order = orderDatabase.getOrderByOrderNo(orderNo);
    
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
  } catch (error) {
    console.error('根据订单号获取订单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    });
  }
});

// 更新订单
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const order = orderDatabase.updateOrder(id, updateData);
    
    res.json({
      success: true,
      data: order,
      message: '订单更新成功'
    });
  } catch (error) {
    console.error('更新订单失败:', error);
    const statusCode = error.message === '订单不存在' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: '更新订单失败',
      error: error.message
    });
  }
});

// 更新订单状态
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '订单状态不能为空'
      });
    }
    
    const order = orderDatabase.updateOrderStatus(id, status, notes);
    
    res.json({
      success: true,
      data: order,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    const statusCode = error.message === '订单不存在' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: '更新订单状态失败',
      error: error.message
    });
  }
});

// 删除订单
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    orderDatabase.deleteOrder(id);
    
    res.json({
      success: true,
      message: '订单删除成功'
    });
  } catch (error) {
    console.error('删除订单失败:', error);
    const statusCode = error.message === '订单不存在' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: '删除订单失败',
      error: error.message
    });
  }
});

// 获取订单统计信息
router.get('/analytics/stats', (req, res) => {
  try {
    const stats = orderDatabase.getOrderStats();
    
    res.json({
      success: true,
      data: stats,
      message: '获取订单统计成功'
    });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单统计失败',
      error: error.message
    });
  }
});

// 根据客户手机号获取订单历史
router.get('/customer/:phone', (req, res) => {
  try {
    const { phone } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }
    
    const options = {
      phone: phone,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const orders = orderDatabase.getAllOrders(options);
    
    res.json({
      success: true,
      data: orders,
      total: orders.length,
      customerPhone: phone,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: orders.length === parseInt(limit)
      },
      message: '获取客户订单历史成功'
    });
  } catch (error) {
    console.error('获取客户订单历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取客户订单历史失败',
      error: error.message
    });
  }
});

// 获取待处理订单（状态为 pending 或 confirmed）
router.get('/status/pending', (req, res) => {
  try {
    const pendingOrders = orderDatabase.getAllOrders({ 
      status: 'pending',
      sortBy: 'createdAt',
      sortOrder: 'asc'
    });
    
    const confirmedOrders = orderDatabase.getAllOrders({ 
      status: 'confirmed',
      sortBy: 'createdAt',
      sortOrder: 'asc'
    });
    
    const allPendingOrders = [...pendingOrders, ...confirmedOrders]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    res.json({
      success: true,
      data: allPendingOrders,
      total: allPendingOrders.length,
      counts: {
        pending: pendingOrders.length,
        confirmed: confirmedOrders.length
      },
      message: '获取待处理订单成功'
    });
  } catch (error) {
    console.error('获取待处理订单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取待处理订单失败',
      error: error.message
    });
  }
});

// 批量更新订单状态
router.patch('/batch/status', (req, res) => {
  try {
    const { orderIds, status, notes } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '订单ID列表不能为空'
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '订单状态不能为空'
      });
    }
    
    const results = [];
    const errors = [];
    
    orderIds.forEach(id => {
      try {
        const order = orderDatabase.updateOrderStatus(id, status, notes);
        results.push(order);
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    });
    
    res.json({
      success: errors.length === 0,
      data: {
        updated: results,
        errors: errors,
        successCount: results.length,
        errorCount: errors.length
      },
      message: `批量更新完成：成功 ${results.length} 个，失败 ${errors.length} 个`
    });
  } catch (error) {
    console.error('批量更新订单状态失败:', error);
    res.status(500).json({
      success: false,
      message: '批量更新订单状态失败',
      error: error.message
    });
  }
});

// 验证订单数据
router.post('/validate', (req, res) => {
  try {
    const orderData = req.body;
    
    // 创建临时订单实例进行验证
    const { Order } = require('../models/Order');
    const tempOrder = new Order(orderData);
    const validation = tempOrder.validate();
    
    res.json({
      success: validation.isValid,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        orderData: validation.isValid ? tempOrder.toJSON() : null
      },
      message: validation.isValid ? '订单数据验证通过' : '订单数据验证失败'
    });
  } catch (error) {
    console.error('订单数据验证失败:', error);
    res.status(500).json({
      success: false,
      message: '订单数据验证失败',
      error: error.message
    });
  }
});

// 更新订单状态 (PUT方法，用于管理员界面)
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '订单状态不能为空'
      });
    }
    
    const order = orderDatabase.updateOrderStatus(id, status);
    
    res.json({
      success: true,
      data: order,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    const statusCode = error.message === '订单不存在' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: '更新订单状态失败',
      error: error.message
    });
  }
});

module.exports = router; 