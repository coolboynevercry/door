// 生成订单号
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BDL${year}${month}${day}${random}`;
}

// 生成合同号
function generateContractNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HT-${year}${month}${day}-${random}`;
}

// 数据验证工具
const validators = {
  // 手机号验证
  phone: (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 邮箱验证
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 密码强度验证
  password: (password) => {
    // 至少6位，包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  },

  // 价格验证
  price: (price) => {
    return !isNaN(price) && parseFloat(price) >= 0;
  },

  // 必填字段验证
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  }
};

// 数据清理工具
const sanitizers = {
  // 清理HTML标签
  html: (str) => {
    return str.replace(/<[^>]*>/g, '');
  },

  // 清理空白字符
  trim: (str) => {
    return typeof str === 'string' ? str.trim() : str;
  },

  // 数字转换
  number: (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  },

  // 整数转换
  integer: (value) => {
    const num = parseInt(value);
    return isNaN(num) ? 0 : num;
  }
};

// 分页计算
function calculatePagination(page = 1, limit = 20, total = 0) {
  const currentPage = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit))); // 限制最大100条
  const offset = (currentPage - 1) * pageSize;
  const totalPages = Math.ceil(total / pageSize);

  return {
    page: currentPage,
    limit: pageSize,
    offset,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

// 日期格式化
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 文件大小格式化
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 错误信息映射
const errorMessages = {
  INVALID_PHONE: '请输入有效的手机号码',
  INVALID_EMAIL: '请输入有效的邮箱地址',
  INVALID_PASSWORD: '密码至少6位，必须包含字母和数字',
  REQUIRED_FIELD: '该字段为必填项',
  INVALID_PRICE: '请输入有效的价格',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '资源不存在',
  DUPLICATE_ENTRY: '数据已存在',
  DATABASE_ERROR: '数据库操作失败',
  FILE_TOO_LARGE: '文件大小超出限制',
  INVALID_FILE_TYPE: '不支持的文件类型'
};

// 获取错误信息
function getErrorMessage(code, defaultMessage = '操作失败') {
  return errorMessages[code] || defaultMessage;
}

// 状态映射
const statusMaps = {
  order: {
    'pending': '待确认',
    'confirmed': '已确认',
    'measuring': '待测量',
    'measured': '已测量',
    'production': '生产中',
    'ready': '待安装',
    'installing': '安装中',
    'completed': '已完成',
    'cancelled': '已取消'
  },
  
  contract: {
    'draft': '草稿',
    'active': '生效',
    'completed': '完成',
    'cancelled': '取消'
  },
  
  user: {
    'active': '活跃',
    'inactive': '禁用'
  }
};

// 获取状态显示名称
function getStatusName(type, status) {
  return statusMaps[type]?.[status] || status;
}

// 深度克隆对象
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 导出所有函数和对象
module.exports = {
  generateOrderNumber,
  generateContractNumber,
  validators,
  sanitizers,
  calculatePagination,
  formatDate,
  formatFileSize,
  errorMessages,
  getErrorMessage,
  statusMaps,
  getStatusName,
  deepClone,
  debounce,
  throttle
}; 