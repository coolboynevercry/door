const express = require('express');
const { productDatabase } = require('../models/Product');

const router = express.Router();

// 获取所有产品
router.get('/', (req, res) => {
  try {
    const { category, search, limit } = req.query;
    let products = productDatabase.getAllProducts();
    
    // 按分类过滤
    if (category) {
      products = productDatabase.getProductsByCategory(category);
    }
    
    // 搜索过滤
    if (search) {
      products = productDatabase.searchProducts(search);
    }
    
    // 限制返回数量
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        products = products.slice(0, limitNum);
      }
    }
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      message: '获取产品列表成功'
    });
  } catch (error) {
    console.error('获取产品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品列表失败',
      error: error.message
    });
  }
});

// 根据ID获取单个产品
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = productDatabase.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: '获取产品详情成功'
    });
  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品详情失败',
      error: error.message
    });
  }
});

// 获取产品的变体选项
router.get('/:id/variants', (req, res) => {
  try {
    const { id } = req.params;
    const product = productDatabase.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    const variants = product.variants || [];
    
    res.json({
      success: true,
      data: variants,
      total: variants.length,
      message: '获取产品变体成功'
    });
  } catch (error) {
    console.error('获取产品变体失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品变体失败',
      error: error.message
    });
  }
});

// 搜索产品
router.get('/search/:keyword', (req, res) => {
  try {
    const { keyword } = req.params;
    const { limit } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }
    
    let products = productDatabase.searchProducts(keyword);
    
    // 限制返回数量
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        products = products.slice(0, limitNum);
      }
    }
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      keyword: keyword,
      message: `搜索到 ${products.length} 个相关产品`
    });
  } catch (error) {
    console.error('搜索产品失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索产品失败',
      error: error.message
    });
  }
});

// 获取热门产品（模拟数据）
router.get('/featured/hot', (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const allProducts = productDatabase.getAllProducts();
    
    // 简单模拟热门产品（取前几个产品）
    const hotProducts = allProducts.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: hotProducts,
      total: hotProducts.length,
      message: '获取热门产品成功'
    });
  } catch (error) {
    console.error('获取热门产品失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门产品失败',
      error: error.message
    });
  }
});

// 获取推荐产品（模拟数据）
router.get('/featured/recommended', (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const allProducts = productDatabase.getAllProducts();
    
    // 简单模拟推荐产品（取随机几个产品）
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: recommended,
      total: recommended.length,
      message: '获取推荐产品成功'
    });
  } catch (error) {
    console.error('获取推荐产品失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐产品失败',
      error: error.message
    });
  }
});

// 批量获取产品详情
router.post('/batch', (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: '产品ID列表格式不正确'
      });
    }
    
    const products = productIds
      .map(id => productDatabase.getProductById(id))
      .filter(product => product !== null);
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      requested: productIds.length,
      message: `成功获取 ${products.length}/${productIds.length} 个产品详情`
    });
  } catch (error) {
    console.error('批量获取产品失败:', error);
    res.status(500).json({
      success: false,
      message: '批量获取产品失败',
      error: error.message
    });
  }
});

// 获取产品价格范围
router.get('/:id/price-range', (req, res) => {
  try {
    const { id } = req.params;
    const product = productDatabase.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    let minPrice = product.price;
    let maxPrice = product.price;
    
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => v.price);
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }
    
    res.json({
      success: true,
      data: {
        minPrice,
        maxPrice,
        priceUnit: product.priceUnit,
        hasVariants: product.variants && product.variants.length > 0
      },
      message: '获取价格范围成功'
    });
  } catch (error) {
    console.error('获取价格范围失败:', error);
    res.status(500).json({
      success: false,
      message: '获取价格范围失败',
      error: error.message
    });
  }
});

// 验证产品配置
router.post('/:id/validate', (req, res) => {
  try {
    const { id } = req.params;
    const { variant, color, quantity } = req.body;
    
    const product = productDatabase.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    const errors = [];
    
    // 验证变体
    if (product.variants && product.variants.length > 0) {
      if (!variant) {
        errors.push('请选择产品类型');
      } else {
        const validVariant = product.variants.find(v => v.type === variant);
        if (!validVariant) {
          errors.push('选择的产品类型不存在');
        }
      }
    }
    
    // 验证颜色
    if (product.colors && product.colors.length > 0) {
      if (!color) {
        errors.push('请选择颜色');
      } else if (!product.colors.includes(color)) {
        errors.push('选择的颜色不可用');
      }
    }
    
    // 验证数量
    if (!quantity || quantity <= 0) {
      errors.push('数量必须大于0');
    }
    
    const isValid = errors.length === 0;
    
    res.json({
      success: isValid,
      data: {
        isValid,
        errors,
        productId: id,
        configuration: { variant, color, quantity }
      },
      message: isValid ? '产品配置验证通过' : '产品配置验证失败'
    });
  } catch (error) {
    console.error('产品配置验证失败:', error);
    res.status(500).json({
      success: false,
      message: '产品配置验证失败',
      error: error.message
    });
  }
});

// 管理员专用路由 - 需要在server.js中添加认证中间件

// 添加新产品 (管理员)
router.post('/', (req, res) => {
  try {
    const productData = req.body;
    
    // 验证必填字段
    const requiredFields = ['name', 'category', 'price', 'image'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `缺少必填字段: ${missingFields.join(', ')}`
      });
    }
    
    // 生成新的产品ID
    const allProducts = productDatabase.getAllProducts();
    const newId = (Math.max(...allProducts.map(p => parseInt(p.id))) + 1).toString();
    
    const newProduct = {
      id: newId,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    // 这里应该添加到数据库，现在只是返回成功
    res.status(201).json({
      success: true,
      data: newProduct,
      message: '产品添加成功'
    });
  } catch (error) {
    console.error('添加产品失败:', error);
    res.status(500).json({
      success: false,
      message: '添加产品失败',
      error: error.message
    });
  }
});

// 更新产品 (管理员)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = productDatabase.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    // 这里应该更新到数据库，现在只是返回成功
    const updatedProduct = {
      ...product,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedProduct,
      message: '产品更新成功'
    });
  } catch (error) {
    console.error('更新产品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新产品失败',
      error: error.message
    });
  }
});

// 删除产品 (管理员)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const product = productDatabase.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    // 这里应该从数据库删除，现在只是返回成功
    res.json({
      success: true,
      message: '产品删除成功'
    });
  } catch (error) {
    console.error('删除产品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除产品失败',
      error: error.message
    });
  }
});

module.exports = router; 