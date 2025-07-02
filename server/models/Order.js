const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// 订单数据模型
class Order {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.orderNo = data.orderNo || this.generateOrderNo();
    
    // 客户信息
    this.customerInfo = {
      name: data.customerInfo?.name || '',
      phone: data.customerInfo?.phone || '',
      wechatId: data.customerInfo?.wechatId || '',
      address: {
        district: data.customerInfo?.address?.district || '',
        detailed: data.customerInfo?.address?.detailed || ''
      }
    };
    
    // 预约信息
    this.appointment = {
      measurementDate: data.appointment?.measurementDate || '',
      measurementTime: data.appointment?.measurementTime || '',
      notes: data.appointment?.notes || ''
    };
    
    // 订单商品
    this.items = data.items || [];
    
    // 价格信息
    this.pricing = {
      subtotal: data.pricing?.subtotal || 0,
      discount: data.pricing?.discount || 0,
      total: data.pricing?.total || 0
    };
    
    // 订单状态
    this.status = data.status || 'pending'; // pending, confirmed, measuring, producing, installing, completed, cancelled
    this.priority = data.priority || 'normal'; // low, normal, high, urgent
    
    // 时间戳
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.confirmedAt = data.confirmedAt || null;
    this.completedAt = data.completedAt || null;
    
    // 备注和特殊要求
    this.notes = data.notes || '';
    this.specialRequirements = data.specialRequirements || [];
    
    // 安装信息
    this.installation = {
      scheduledDate: data.installation?.scheduledDate || '',
      actualDate: data.installation?.actualDate || '',
      installer: data.installation?.installer || '',
      installationNotes: data.installation?.installationNotes || ''
    };
  }

  // 生成订单号
  generateOrderNo() {
    const now = moment();
    const prefix = 'BDL'; // 宝得利
    const date = now.format('YYYYMMDD');
    const time = now.format('HHmmss');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${date}${time}${random}`;
  }

  // 验证订单数据
  validate() {
    const errors = [];
    
    // 验证客户信息
    if (!this.customerInfo.name || this.customerInfo.name.trim() === '') {
      errors.push('客户姓名不能为空');
    }
    
    if (!this.customerInfo.phone || this.customerInfo.phone.trim() === '') {
      errors.push('客户手机号不能为空');
    } else if (!/^1[3-9]\d{9}$/.test(this.customerInfo.phone)) {
      errors.push('手机号格式不正确');
    }
    
    if (!this.customerInfo.address.district || this.customerInfo.address.district.trim() === '') {
      errors.push('区县信息不能为空');
    }
    
    if (!this.customerInfo.address.detailed || this.customerInfo.address.detailed.trim() === '') {
      errors.push('详细地址不能为空');
    }
    
    // 验证预约信息
    if (!this.appointment.measurementDate || this.appointment.measurementDate.trim() === '') {
      errors.push('预约测量日期不能为空');
    }
    
    if (!this.appointment.measurementTime || this.appointment.measurementTime.trim() === '') {
      errors.push('预约测量时间不能为空');
    }
    
    // 验证订单商品
    if (!this.items || this.items.length === 0) {
      errors.push('订单商品不能为空');
    } else {
      this.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`第${index + 1}个商品ID不能为空`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`第${index + 1}个商品数量必须大于0`);
        }
        if (!item.price || item.price <= 0) {
          errors.push(`第${index + 1}个商品价格必须大于0`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 计算订单总价
  calculateTotal() {
    const subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    this.pricing.subtotal = subtotal;
    this.pricing.total = subtotal - this.pricing.discount;
    this.updatedAt = new Date().toISOString();
    
    return this.pricing.total;
  }

  // 更新订单状态
  updateStatus(newStatus, notes = '') {
    const validStatuses = ['pending', 'confirmed', 'measuring', 'producing', 'installing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`无效的订单状态: ${newStatus}`);
    }
    
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    
    if (newStatus === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = new Date().toISOString();
    }
    
    if (newStatus === 'completed' && !this.completedAt) {
      this.completedAt = new Date().toISOString();
    }
    
    if (notes) {
      this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
    }
  }

  // 添加商品到订单
  addItem(item) {
    const validation = this.validateItem(item);
    if (!validation.isValid) {
      throw new Error(`商品验证失败: ${validation.errors.join(', ')}`);
    }
    
    this.items.push({
      id: item.id || uuidv4(),
      productId: item.productId,
      productName: item.productName,
      variant: item.variant || null,
      color: item.color || null,
      specifications: item.specifications || '',
      quantity: item.quantity,
      price: item.price,
      priceUnit: item.priceUnit || '个',
      notes: item.notes || ''
    });
    
    this.calculateTotal();
  }

  // 验证商品项
  validateItem(item) {
    const errors = [];
    
    if (!item.productId) errors.push('商品ID不能为空');
    if (!item.productName) errors.push('商品名称不能为空');
    if (!item.quantity || item.quantity <= 0) errors.push('商品数量必须大于0');
    if (!item.price || item.price <= 0) errors.push('商品价格必须大于0');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 转换为API响应格式
  toJSON() {
    return {
      id: this.id,
      orderNo: this.orderNo,
      customerInfo: this.customerInfo,
      appointment: this.appointment,
      items: this.items,
      pricing: this.pricing,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      confirmedAt: this.confirmedAt,
      completedAt: this.completedAt,
      notes: this.notes,
      specialRequirements: this.specialRequirements,
      installation: this.installation
    };
  }

  // 获取订单摘要信息
  getSummary() {
    return {
      id: this.id,
      orderNo: this.orderNo,
      customerName: this.customerInfo.name,
      customerPhone: this.customerInfo.phone,
      status: this.status,
      total: this.pricing.total,
      itemCount: this.items.length,
      createdAt: this.createdAt,
      measurementDate: this.appointment.measurementDate
    };
  }
}

// 模拟订单数据库
class OrderDatabase {
  constructor() {
    this.orders = [];
    this.nextId = 1;
  }

  // 创建新订单
  createOrder(orderData) {
    const order = new Order(orderData);
    const validation = order.validate();
    
    if (!validation.isValid) {
      throw new Error(`订单验证失败: ${validation.errors.join(', ')}`);
    }
    
    order.calculateTotal();
    this.orders.push(order);
    return order.toJSON();
  }

  // 获取所有订单
  getAllOrders(options = {}) {
    let filteredOrders = [...this.orders];
    
    // 按状态过滤
    if (options.status) {
      filteredOrders = filteredOrders.filter(order => order.status === options.status);
    }
    
    // 按客户手机号过滤
    if (options.phone) {
      filteredOrders = filteredOrders.filter(order => 
        order.customerInfo.phone.includes(options.phone)
      );
    }
    
    // 按日期范围过滤
    if (options.startDate || options.endDate) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = moment(order.createdAt);
        const start = options.startDate ? moment(options.startDate) : null;
        const end = options.endDate ? moment(options.endDate) : null;
        
        if (start && orderDate.isBefore(start)) return false;
        if (end && orderDate.isAfter(end)) return false;
        return true;
      });
    }
    
    // 排序
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    
    filteredOrders.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'total') {
        aValue = a.pricing.total;
        bValue = b.pricing.total;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    // 分页
    if (options.page && options.limit) {
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      filteredOrders = filteredOrders.slice(startIndex, endIndex);
    }
    
    return filteredOrders.map(order => order.toJSON());
  }

  // 根据ID获取订单
  getOrderById(id) {
    const order = this.orders.find(order => order.id === id);
    return order ? order.toJSON() : null;
  }

  // 根据订单号获取订单
  getOrderByOrderNo(orderNo) {
    const order = this.orders.find(order => order.orderNo === orderNo);
    return order ? order.toJSON() : null;
  }

  // 更新订单
  updateOrder(id, updateData) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      throw new Error('订单不存在');
    }
    
    const order = this.orders[orderIndex];
    Object.assign(order, updateData);
    order.updatedAt = new Date().toISOString();
    
    const validation = order.validate();
    if (!validation.isValid) {
      throw new Error(`订单验证失败: ${validation.errors.join(', ')}`);
    }
    
    order.calculateTotal();
    return order.toJSON();
  }

  // 更新订单状态
  updateOrderStatus(id, status, notes = '') {
    const order = this.orders.find(order => order.id === id);
    if (!order) {
      throw new Error('订单不存在');
    }
    
    order.updateStatus(status, notes);
    return order.toJSON();
  }

  // 删除订单
  deleteOrder(id) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      throw new Error('订单不存在');
    }
    
    this.orders.splice(orderIndex, 1);
    return true;
  }

  // 获取订单统计信息
  getOrderStats() {
    const total = this.orders.length;
    const statusCounts = {};
    let totalRevenue = 0;
    
    this.orders.forEach(order => {
      // 统计状态
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      
      // 计算总收入
      if (order.status === 'completed') {
        totalRevenue += order.pricing.total;
      }
    });
    
    return {
      total,
      statusCounts,
      totalRevenue,
      averageOrderValue: total > 0 ? totalRevenue / total : 0
    };
  }
}

// 创建全局实例
const orderDatabase = new OrderDatabase();

module.exports = {
  Order,
  OrderDatabase,
  orderDatabase
}; 