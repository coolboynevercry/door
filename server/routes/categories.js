const express = require('express');
const { productDatabase } = require('../models/Product');

const router = express.Router();

// 获取所有产品分类
router.get('/', (req, res) => {
  try {
    const categories = productDatabase.getCategories();
    
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: '获取产品分类成功'
    });
  } catch (error) {
    console.error('获取产品分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品分类失败',
      error: error.message
    });
  }
});

// 获取分类下的产品列表
router.get('/:categoryName/products', (req, res) => {
  try {
    const { categoryName } = req.params;
    const { limit, sortBy = 'id', sortOrder = 'asc' } = req.query;
    
    if (!categoryName || categoryName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }
    
    let products = productDatabase.getProductsByCategory(decodeURIComponent(categoryName));
    
    // 排序
    products.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'price') {
        // 如果有variants，使用最低价格排序
        if (a.variants && a.variants.length > 0) {
          aValue = Math.min(...a.variants.map(v => v.price));
        }
        if (b.variants && b.variants.length > 0) {
          bValue = Math.min(...b.variants.map(v => v.price));
        }
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
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
      category: categoryName,
      sorting: { sortBy, sortOrder },
      message: `获取分类 "${categoryName}" 下的产品成功`
    });
  } catch (error) {
    console.error('获取分类产品失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类产品失败',
      error: error.message
    });
  }
});

// 获取分类统计信息
router.get('/:categoryName/stats', (req, res) => {
  try {
    const { categoryName } = req.params;
    
    if (!categoryName || categoryName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }
    
    const products = productDatabase.getProductsByCategory(decodeURIComponent(categoryName));
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在或没有产品'
      });
    }
    
    // 计算价格统计
    const prices = [];
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          prices.push(variant.price);
        });
      } else {
        prices.push(product.price);
      }
    });
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // 计算材质统计
    const materials = {};
    products.forEach(product => {
      if (product.material) {
        materials[product.material] = (materials[product.material] || 0) + 1;
      }
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          if (variant.material) {
            materials[variant.material] = (materials[variant.material] || 0) + 1;
          }
        });
      }
    });
    
    // 计算价格区间分布
    const priceRanges = {
      '0-500': 0,
      '500-1000': 0,
      '1000-2000': 0,
      '2000-3000': 0,
      '3000+': 0
    };
    
    prices.forEach(price => {
      if (price < 500) priceRanges['0-500']++;
      else if (price < 1000) priceRanges['500-1000']++;
      else if (price < 2000) priceRanges['1000-2000']++;
      else if (price < 3000) priceRanges['2000-3000']++;
      else priceRanges['3000+']++;
    });
    
    const stats = {
      category: categoryName,
      productCount: products.length,
      variantCount: prices.length,
      priceStats: {
        min: minPrice,
        max: maxPrice,
        average: Math.round(avgPrice * 100) / 100,
        ranges: priceRanges
      },
      materials: materials,
      hasColors: products.some(p => p.colors && p.colors.length > 0),
      hasVariants: products.some(p => p.variants && p.variants.length > 0)
    };
    
    res.json({
      success: true,
      data: stats,
      message: `获取分类 "${categoryName}" 统计信息成功`
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败',
      error: error.message
    });
  }
});

// 获取门类产品分类（门的所有分类）
router.get('/type/doors', (req, res) => {
  try {
    const allCategories = productDatabase.getCategories();
    const doorCategories = allCategories.filter(category => 
      category.name.includes('门') && !category.name.includes('窗')
    );
    
    res.json({
      success: true,
      data: doorCategories,
      total: doorCategories.length,
      message: '获取门类产品分类成功'
    });
  } catch (error) {
    console.error('获取门类产品分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取门类产品分类失败',
      error: error.message
    });
  }
});

// 获取窗类产品分类（窗的所有分类）
router.get('/type/windows', (req, res) => {
  try {
    const allCategories = productDatabase.getCategories();
    const windowCategories = allCategories.filter(category => 
      category.name.includes('窗')
    );
    
    res.json({
      success: true,
      data: windowCategories,
      total: windowCategories.length,
      message: '获取窗类产品分类成功'
    });
  } catch (error) {
    console.error('获取窗类产品分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取窗类产品分类失败',
      error: error.message
    });
  }
});

// 获取配件类产品分类
router.get('/type/accessories', (req, res) => {
  try {
    const allCategories = productDatabase.getCategories();
    const accessoryCategories = allCategories.filter(category => 
      !category.name.includes('门') && !category.name.includes('窗')
    );
    
    res.json({
      success: true,
      data: accessoryCategories,
      total: accessoryCategories.length,
      message: '获取配件类产品分类成功'
    });
  } catch (error) {
    console.error('获取配件类产品分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配件类产品分类失败',
      error: error.message
    });
  }
});

// 搜索分类
router.get('/search/:keyword', (req, res) => {
  try {
    const { keyword } = req.params;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }
    
    const allCategories = productDatabase.getCategories();
    const filteredCategories = allCategories.filter(category =>
      category.name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    res.json({
      success: true,
      data: filteredCategories,
      total: filteredCategories.length,
      keyword: keyword,
      message: `搜索到 ${filteredCategories.length} 个相关分类`
    });
  } catch (error) {
    console.error('搜索分类失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索分类失败',
      error: error.message
    });
  }
});

// 获取分类树结构
router.get('/tree/structure', (req, res) => {
  try {
    const allCategories = productDatabase.getCategories();
    
    const categoryTree = {
      doors: {
        name: '门类产品',
        icon: '🚪',
        categories: allCategories.filter(cat => 
          cat.name.includes('门') && !cat.name.includes('窗')
        )
      },
      windows: {
        name: '窗类产品', 
        icon: '🪟',
        categories: allCategories.filter(cat => 
          cat.name.includes('窗')
        )
      },
      accessories: {
        name: '配件产品',
        icon: '🔧',
        categories: allCategories.filter(cat => 
          !cat.name.includes('门') && !cat.name.includes('窗')
        )
      }
    };
    
    const totalProducts = allCategories.reduce((sum, cat) => sum + cat.count, 0);
    
    res.json({
      success: true,
      data: {
        tree: categoryTree,
        summary: {
          totalCategories: allCategories.length,
          totalProducts: totalProducts,
          doorCategories: categoryTree.doors.categories.length,
          windowCategories: categoryTree.windows.categories.length,
          accessoryCategories: categoryTree.accessories.categories.length
        }
      },
      message: '获取分类树结构成功'
    });
  } catch (error) {
    console.error('获取分类树结构失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类树结构失败',
      error: error.message
    });
  }
});

module.exports = router; 