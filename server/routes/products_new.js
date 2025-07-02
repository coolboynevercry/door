const express = require('express');
const { Product } = require('../models/sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// 获取所有商品（公开接口）
router.get('/', async (req, res) => {
  try {
    const { category, search, limit, page = 1 } = req.query;
    const where = { status: 'active' };
    
    // 分类过滤
    if (category) {
      where.category = category;
    }
    
    // 搜索过滤
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 分页配置
    const pageSize = limit ? parseInt(limit) : 20;
    const offset = (parseInt(page) - 1) * pageSize;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: products,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      },
      message: '获取商品列表成功'
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败'
    });
  }
});

// 根据ID获取单个商品（公开接口）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: '获取商品详情成功'
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败'
    });
  }
});

// 添加商品（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productData = req.body;
    
    // 验证必填字段
    const requiredFields = ['name', 'category', 'price'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `缺少必填字段: ${missingFields.join(', ')}`
      });
    }
    
    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      data: product,
      message: '商品添加成功'
    });
  } catch (error) {
    console.error('添加商品失败:', error);
    res.status(500).json({
      success: false,
      message: '添加商品失败'
    });
  }
});

// 更新商品（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    await product.update(updateData);
    
    res.json({
      success: true,
      data: product,
      message: '商品更新成功'
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新商品失败'
    });
  }
});

// 删除商品（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    // 软删除 - 将状态设为inactive
    await product.update({ status: 'inactive' });
    
    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除商品失败'
    });
  }
});

// 获取商品分类列表
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: ['category'],
      where: { status: 'active' },
      group: ['category'],
      raw: true
    });
    
    const categoryList = categories.map(item => item.category);
    
    res.json({
      success: true,
      data: categoryList,
      message: '获取分类列表成功'
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

module.exports = router;
