// Netlify API配置
const API_CONFIG = {
  // Netlify部署后的API基础URL
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions' 
    : 'http://localhost:8888/.netlify/functions',
  
  // API超时时间
  TIMEOUT: 10000,
  
  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API端点配置
export const API_ENDPOINTS = {
  // 基础API
  HEALTH: `${API_CONFIG.BASE_URL}/health`,
  TEST: `${API_CONFIG.BASE_URL}/test`,
  
  // 管理员API
  ADMIN_LOGIN: `${API_CONFIG.BASE_URL}/admin-login`,
  
  // 产品API
  PRODUCTS: `${API_CONFIG.BASE_URL}/products`,
  
  // 用户API
  USER_REGISTER: `${API_CONFIG.BASE_URL}/user-register`,
  USER_LOGIN: `${API_CONFIG.BASE_URL}/user-login`,
  
  // 订单API
  ORDERS: `${API_CONFIG.BASE_URL}/orders`,
  
  // 聊天API
  CHAT: `${API_CONFIG.BASE_URL}/chat`
};

// HTTP请求工具
export const apiRequest = async (url, options = {}) => {
  const config = {
    method: 'GET',
    headers: API_CONFIG.HEADERS,
    ...options
  };

  // 添加认证头
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 导出配置
export default API_CONFIG; 