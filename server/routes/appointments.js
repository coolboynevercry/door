const express = require('express')
const { Op } = require('sequelize')
const Order = require('../models/sequelize/Order')
const auth = require('../middleware/auth')

const router = express.Router()

// 管理员权限验证
router.use(auth.verifyAdmin)

// 获取测量预约列表
router.get('/measurements', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', date = '' } = req.query
    const offset = (page - 1) * limit
    
    let whereCondition = {}
    
    // 按状态筛选
    if (status === 'scheduled') {
      whereCondition.measurementScheduled = { [Op.not]: null }
      whereCondition.measurementCompleted = null
    } else if (status === 'completed') {
      whereCondition.measurementCompleted = { [Op.not]: null }
    } else if (status === 'pending') {
      whereCondition.measurementScheduled = null
      whereCondition.status = { [Op.in]: ['pending', 'measuring'] }
    }
    
    // 按日期筛选
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      whereCondition.measurementScheduled = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      }
    }
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      order: [
        ['measurementScheduled', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    res.json({
      success: true,
      data: {
        orders,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取测量预约列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    })
  }
})

// 获取安装预约列表
router.get('/installations', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', date = '' } = req.query
    const offset = (page - 1) * limit
    
    let whereCondition = {
      measurementCompleted: { [Op.not]: null } // 只有测量完成的订单才能安装
    }
    
    // 按状态筛选
    if (status === 'scheduled') {
      whereCondition.installationScheduled = { [Op.not]: null }
      whereCondition.installationCompleted = null
    } else if (status === 'completed') {
      whereCondition.installationCompleted = { [Op.not]: null }
    } else if (status === 'pending') {
      whereCondition.installationScheduled = null
      whereCondition.status = { [Op.in]: ['measured', 'producing'] }
    }
    
    // 按日期筛选
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      whereCondition.installationScheduled = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      }
    }
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      order: [
        ['installationScheduled', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    res.json({
      success: true,
      data: {
        orders,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取安装预约列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    })
  }
})

// 安排测量预约
router.post('/measurements/:orderId/schedule', async (req, res) => {
  try {
    const { orderId } = req.params
    const { scheduledTime, notes } = req.body
    
    if (!scheduledTime) {
      return res.status(400).json({
        success: false,
        message: '预约时间不能为空'
      })
    }
    
    const order = await Order.findByPk(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }
    
    // 更新预约时间和状态
    await order.update({
      measurementScheduled: new Date(scheduledTime),
      status: 'measuring',
      notes: notes ? `${order.notes || ''}\n测量预约: ${notes}`.trim() : order.notes
    })
    
    res.json({
      success: true,
      message: '测量预约安排成功',
      data: order
    })
  } catch (error) {
    console.error('安排测量预约失败:', error)
    res.status(500).json({
      success: false,
      message: '安排预约失败'
    })
  }
})

// 完成测量
router.post('/measurements/:orderId/complete', async (req, res) => {
  try {
    const { orderId } = req.params
    const { notes, actualSize } = req.body
    
    const order = await Order.findByPk(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }
    
    // 更新完成时间和状态
    await order.update({
      measurementCompleted: new Date(),
      status: 'measured',
      notes: notes ? `${order.notes || ''}\n测量完成: ${notes}`.trim() : order.notes
    })
    
    res.json({
      success: true,
      message: '测量完成记录成功',
      data: order
    })
  } catch (error) {
    console.error('完成测量失败:', error)
    res.status(500).json({
      success: false,
      message: '完成测量失败'
    })
  }
})

// 安排安装预约
router.post('/installations/:orderId/schedule', async (req, res) => {
  try {
    const { orderId } = req.params
    const { scheduledTime, notes } = req.body
    
    if (!scheduledTime) {
      return res.status(400).json({
        success: false,
        message: '预约时间不能为空'
      })
    }
    
    const order = await Order.findByPk(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }
    
    if (!order.measurementCompleted) {
      return res.status(400).json({
        success: false,
        message: '该订单尚未完成测量，无法安排安装'
      })
    }
    
    // 更新预约时间和状态
    await order.update({
      installationScheduled: new Date(scheduledTime),
      status: 'installing',
      notes: notes ? `${order.notes || ''}\n安装预约: ${notes}`.trim() : order.notes
    })
    
    res.json({
      success: true,
      message: '安装预约安排成功',
      data: order
    })
  } catch (error) {
    console.error('安排安装预约失败:', error)
    res.status(500).json({
      success: false,
      message: '安排预约失败'
    })
  }
})

// 完成安装
router.post('/installations/:orderId/complete', async (req, res) => {
  try {
    const { orderId } = req.params
    const { notes } = req.body
    
    const order = await Order.findByPk(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }
    
    // 更新完成时间和状态
    await order.update({
      installationCompleted: new Date(),
      status: 'completed',
      notes: notes ? `${order.notes || ''}\n安装完成: ${notes}`.trim() : order.notes
    })
    
    res.json({
      success: true,
      message: '安装完成记录成功',
      data: order
    })
  } catch (error) {
    console.error('完成安装失败:', error)
    res.status(500).json({
      success: false,
      message: '完成安装失败'
    })
  }
})

// 获取预约统计
router.get('/statistics', async (req, res) => {
  try {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // 今日测量预约
    const todayMeasurements = await Order.count({
      where: {
        measurementScheduled: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        measurementCompleted: null
      }
    })
    
    // 今日安装预约
    const todayInstallations = await Order.count({
      where: {
        installationScheduled: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        installationCompleted: null
      }
    })
    
    // 待安排测量
    const pendingMeasurements = await Order.count({
      where: {
        measurementScheduled: null,
        status: { [Op.in]: ['pending', 'measuring'] }
      }
    })
    
    // 待安排安装
    const pendingInstallations = await Order.count({
      where: {
        installationScheduled: null,
        measurementCompleted: { [Op.not]: null },
        status: { [Op.in]: ['measured', 'producing'] }
      }
    })
    
    res.json({
      success: true,
      data: {
        todayMeasurements,
        todayInstallations,
        pendingMeasurements,
        pendingInstallations
      }
    })
  } catch (error) {
    console.error('获取预约统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    })
  }
})

module.exports = router 