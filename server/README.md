# 宝得利门窗订购网站后端API

一个基于 Node.js + Express 的门窗商品和订单管理API服务，专为宝得利门窗订购网站设计。

## 📋 项目特性

- ✅ **完整的产品管理** - 支持11种门窗产品，包含variants和颜色选择
- ✅ **订单系统** - 完整的订单创建、状态管理和查询功能
- ✅ **分类管理** - 门类、窗类、配件类产品分类
- ✅ **数据验证** - 完善的输入数据验证和错误处理
- ✅ **CORS支持** - 跨域请求支持
- ✅ **安全配置** - Helmet安全头设置
- ✅ **请求日志** - Morgan日志记录
- ✅ **福清地区定制** - 支持福清市24个区县选择

## 🛠 技术栈

- **Node.js** - JavaScript运行环境
- **Express** - Web应用框架
- **CORS** - 跨域资源共享
- **Body-parser** - 请求体解析
- **Helmet** - 安全头设置
- **Morgan** - HTTP请求日志
- **UUID** - 唯一标识符生成
- **Moment** - 时间处理

## 📦 安装和启动

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装步骤

1. **进入项目目录**
   ```bash
   cd server
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务器**
   ```bash
   # 方式1：使用启动脚本
   ./start.sh
   
   # 方式2：直接运行
   npm start
   
   # 方式3：开发模式（如果安装了nodemon）
   npm run dev
   ```

4. **验证启动**
   服务器启动后会显示：
   ```
   🚀 宝得利门窗API服务器启动成功!
   📍 服务器地址: http://localhost:3000
   🌍 环境: development
   ⏰ 启动时间: 2025/6/29 09:17:41
   ```

## 🌐 API接口文档

### 基础信息

- **服务器地址**: http://localhost:3000
- **API前缀**: /api
- **数据格式**: JSON
- **字符编码**: UTF-8

### 响应格式

所有API响应都遵循统一格式：

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "total": 10  // 列表接口会包含总数
}
```

错误响应格式：
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述"
}
```

### 🛍️ 产品接口

#### 1. 获取所有产品
```http
GET /api/products
```

**查询参数**:
- `category` (可选) - 按分类过滤
- `search` (可选) - 搜索关键词
- `limit` (可选) - 限制返回数量

**示例**:
```bash
curl "http://localhost:3000/api/products?category=入户门&limit=5"
```

#### 2. 获取产品详情
```http
GET /api/products/:id
```

**示例**:
```bash
curl "http://localhost:3000/api/products/1"
```

#### 3. 获取产品变体
```http
GET /api/products/:id/variants
```

#### 4. 搜索产品
```http
GET /api/products/search/:keyword
```

**示例**:
```bash
curl "http://localhost:3000/api/products/search/推拉门"
```

#### 5. 验证产品配置
```http
POST /api/products/:id/validate
Content-Type: application/json

{
  "variant": "锌合金单开门",
  "color": "黑色",
  "quantity": 1
}
```

### 📋 订单接口

#### 1. 创建订单
```http
POST /api/orders
Content-Type: application/json
```

**请求体**:
```json
{
  "customerInfo": {
    "name": "张三",
    "phone": "13800138000",
    "wechatId": "zhangsan_wx",
    "address": {
      "district": "龙田镇",
      "detailed": "龙田大道123号"
    }
  },
  "appointment": {
    "measurementDate": "2025-07-01",
    "measurementTime": "上午9:00-11:00",
    "notes": "需要测量客厅推拉门"
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
}
```

#### 2. 获取订单列表
```http
GET /api/orders
```

**查询参数**:
- `status` - 订单状态过滤
- `phone` - 客户手机号过滤
- `startDate` - 开始日期
- `endDate` - 结束日期
- `page` - 页码
- `limit` - 每页数量

#### 3. 获取订单详情
```http
GET /api/orders/:id
```

#### 4. 更新订单状态
```http
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "已确认订单"
}
```

**订单状态**:
- `pending` - 待处理
- `confirmed` - 已确认
- `measuring` - 测量中
- `producing` - 生产中
- `installing` - 安装中
- `completed` - 已完成
- `cancelled` - 已取消

#### 5. 获取客户订单历史
```http
GET /api/orders/customer/:phone
```

### 🏷️ 分类接口

#### 1. 获取所有分类
```http
GET /api/categories
```

#### 2. 获取分类下的产品
```http
GET /api/categories/:categoryName/products
```

#### 3. 获取分类统计
```http
GET /api/categories/:categoryName/stats
```

#### 4. 获取分类树结构
```http
GET /api/categories/tree/structure
```

### 🔧 其他接口

#### 健康检查
```http
GET /health
```

#### 服务信息
```http
GET /
```

## 📊 数据模型

### 产品模型
```javascript
{
  id: 1,
  name: "入户门",
  price: 1700,
  priceUnit: "起",
  image: "产品图片URL",
  description: "产品描述",
  category: "入户门",
  material: "材质",
  specifications: ["规格1", "规格2"],
  features: ["特性1", "特性2"],
  colors: ["颜色1", "颜色2"],
  variants: [
    {
      type: "锌合金子母门",
      material: "锌合金",
      price: 3000,
      priceUnit: "个",
      specifications: ["规格"],
      features: ["特性"],
      notes: "备注"
    }
  ],
  notes: "产品备注"
}
```

### 订单模型
```javascript
{
  id: "订单ID",
  orderNo: "BDL20250629091821020",
  customerInfo: {
    name: "客户姓名",
    phone: "手机号",
    wechatId: "微信号",
    address: {
      district: "区县",
      detailed: "详细地址"
    }
  },
  appointment: {
    measurementDate: "预约日期",
    measurementTime: "预约时间",
    notes: "预约备注"
  },
  items: [订单商品],
  pricing: {
    subtotal: 小计,
    discount: 折扣,
    total: 总计
  },
  status: "订单状态",
  createdAt: "创建时间"
}
```

## 🚀 使用示例

### 完整的订购流程示例

```bash
# 1. 获取产品列表
curl "http://localhost:3000/api/products"

# 2. 获取特定产品详情
curl "http://localhost:3000/api/products/1"

# 3. 验证产品配置
curl -X POST "http://localhost:3000/api/products/1/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "variant": "锌合金单开门",
    "quantity": 1
  }'

# 4. 创建订单
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "张三",
      "phone": "13800138000",
      "wechatId": "zhangsan_wx",
      "address": {
        "district": "龙田镇",
        "detailed": "龙田大道123号"
      }
    },
    "appointment": {
      "measurementDate": "2025-07-01",
      "measurementTime": "上午9:00-11:00"
    },
    "items": [
      {
        "productId": 1,
        "productName": "入户门",
        "variant": "锌合金单开门",
        "quantity": 1,
        "price": 2500
      }
    ]
  }'

# 5. 查询订单
curl "http://localhost:3000/api/orders"
```

## 🛡️ 错误处理

API使用标准HTTP状态码：

- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 🔧 开发指南

### 项目结构
```
server/
├── models/           # 数据模型
│   ├── Product.js   # 产品模型
│   └── Order.js     # 订单模型
├── routes/          # API路由
│   ├── products.js  # 产品路由
│   ├── orders.js    # 订单路由
│   └── categories.js # 分类路由
├── server.js        # 主服务器文件
├── package.json     # 项目配置
├── start.sh         # 启动脚本
└── README.md        # 项目文档
```

### 添加新功能

1. **添加新的数据模型** - 在 `models/` 目录下创建新文件
2. **添加新的路由** - 在 `routes/` 目录下创建路由文件
3. **注册路由** - 在 `server.js` 中导入并注册新路由

### 环境配置

可以通过环境变量配置服务器：

```bash
# 设置端口
PORT=3000

# 设置运行环境
NODE_ENV=development

# 设置CORS允许的源
CORS_ORIGIN=http://localhost:5173
```

## 🤝 与前端集成

### 前端配置示例 (Vue 3)

```javascript
// api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  // 获取产品列表
  getProducts: () => fetch(`${API_BASE_URL}/products`).then(res => res.json()),
  
  // 创建订单
  createOrder: (orderData) => 
    fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    }).then(res => res.json())
};
```

## 📝 更新日志

### v1.0.0 (2025-06-29)
- ✅ 初始版本发布
- ✅ 完整的产品和订单API
- ✅ 支持11种门窗产品
- ✅ 福清市区县支持
- ✅ 完善的数据验证

## 📞 技术支持

如有问题或建议，请联系宝得利门窗技术团队。

