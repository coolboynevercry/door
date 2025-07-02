# 🚀 快速启动指南

## 1分钟快速启动宝得利门窗API服务

### 步骤1：检查环境
```bash
# 检查Node.js版本（需要 >= 16.0.0）
node --version

# 检查npm版本
npm --version
```

### 步骤2：安装依赖
```bash
cd server
npm install
```

### 步骤3：启动服务器
```bash
# 使用启动脚本（推荐）
./start.sh

# 或者直接运行
node server.js
```

### 步骤4：验证服务
```bash
# 检查服务器状态
curl http://localhost:3000/health

# 获取产品列表
curl http://localhost:3000/api/products
```

## 🧪 API测试示例

### 获取产品信息
```bash
# 获取所有产品
curl "http://localhost:3000/api/products"

# 获取入户门产品
curl "http://localhost:3000/api/products/1"

# 搜索推拉门产品
curl "http://localhost:3000/api/products/search/推拉门"
```

### 创建测试订单
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "测试用户",
      "phone": "13800138000",
      "wechatId": "test_wx",
      "address": {
        "district": "龙田镇",
        "detailed": "测试地址123号"
      }
    },
    "appointment": {
      "measurementDate": "2025-07-01",
      "measurementTime": "上午9:00-11:00",
      "notes": "测试订单"
    },
    "items": [
      {
        "productId": 1,
        "productName": "入户门",
        "variant": "锌合金单开门",
        "quantity": 1,
        "price": 2500,
        "priceUnit": "个"
      }
    ]
  }'
```

### 查看订单
```bash
# 获取所有订单
curl "http://localhost:3000/api/orders"

# 获取待处理订单
curl "http://localhost:3000/api/orders/status/pending"
```

## 🔧 常见问题

### Q: 端口3000被占用怎么办？
A: 修改 `server.js` 中的端口号或关闭占用端口的进程

### Q: 启动时出现依赖错误？
A: 删除 `node_modules` 文件夹，重新运行 `npm install`

### Q: 如何停止服务器？
A: 在终端中按 `Ctrl+C`

### Q: 如何查看服务器日志？
A: 服务器日志会直接显示在终端中

## 📱 前端集成示例

### Vue 3 + Vite
```javascript
// 创建 api.js 文件
const BASE_URL = 'http://localhost:3000/api';

export const getProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`);
  return response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
};
```

### React
```javascript
// 使用 axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const getProducts = () => api.get('/products');
export const createOrder = (data) => api.post('/orders', data);
```

## 🎯 下一步

1. 查看完整的 [README.md](./README.md) 了解详细功能
2. 测试所有API接口
3. 集成到前端项目
4. 根据需要自定义配置

---

**现在您的宝得利门窗API服务已经准备就绪！** 🎉 