// API配置 - 支持开发和生产环境
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000', // Vercel dev server
    timeout: 10000
  },
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || window.location.origin,
    timeout: 30000 // 生产环境超时时间更长，应对Serverless冷启动
  }
};

const currentEnv = import.meta.env.MODE || 'development';
const config = API_CONFIG[currentEnv];

// API请求封装
class ApiClient {
  constructor() {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  async request(url, options = {}) {
    const fullUrl = `${this.baseURL}${url}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // 添加认证token（如果存在）
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const requestOptions = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(fullUrl, {
        ...requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试');
      }
      throw error;
    }
  }

  // GET请求
  get(url, params = {}) {
    const urlParams = new URLSearchParams(params);
    const queryString = urlParams.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request(finalUrl, { method: 'GET' });
  }

  // POST请求
  post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT请求
  put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE请求
  delete(url) {
    return this.request(url, { method: 'DELETE' });
  }

  // 文件上传
  async uploadFile(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// 导出API客户端实例
export const apiClient = new ApiClient();

// 导出配置信息（用于调试）
export { config as apiConfig };

// 常用API端点
export const API_ENDPOINTS = {
  // 用户相关
  USER_LOGIN: '/api/users/login',
  USER_REGISTER: '/api/users/register',
  USER_PROFILE: '/api/users/profile',
  
  // 商品相关
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: '/api/products/:id',
  
  // 订单相关
  ORDERS: '/api/orders',
  USER_ORDERS: '/api/orders/user',
  ORDER_DETAIL: '/api/orders/:id',
  
  // 管理员相关
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_STATS: '/api/admin/stats',
  
  // 合同相关
  CONTRACTS: '/api/contracts',
  
  // 聊天相关
  CHAT_MESSAGES: '/api/chat/messages',
  
  // 文件上传
  UPLOAD_IMAGE: '/api/upload/image',
  UPLOAD_CONTRACT: '/api/upload/contract'
}; 