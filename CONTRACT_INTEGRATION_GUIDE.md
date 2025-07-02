# 宝得利订购网站 - 合同管理功能集成指南

## 功能概述

本次集成将门窗合同报单系统的核心功能成功集成到宝得利订购网站的后台管理系统中。现在管理员可以在订购网站的后台直接生成、管理和下载门窗安装合同。

## 🆕 新增功能

### 1. 合同生成
- **自动合同编号生成**：格式为 `HT-YYYYMMDD-NNNN`
- **基于模板的合同图片生成**：自动在合同模板上填写客户信息、产品详情等
- **多产品支持**：可以在一份合同中包含多个门窗产品
- **自动计算**：总金额和定金（50%）自动计算

### 2. 合同管理
- **合同列表查看**：支持分页浏览所有生成的合同
- **合同详情查看**：查看完整的合同信息和产品明细
- **合同预览**：在线预览生成的合同图片
- **合同下载**：一键下载合同图片文件

### 3. 订单集成
- **从订单生成合同**：在订单管理页面可直接为订单生成合同
- **订单关联**：合同与订单建立关联关系，便于追踪

## 📋 使用指南

### 管理员操作流程

#### 方式一：直接生成合同
1. 登录管理后台
2. 点击主页的"合同管理"卡片
3. 点击"生成新合同"按钮
4. 填写合同信息：
   - 客户名称（必填）
   - 联系电话（可选）
   - 身份证号（可选）
   - 签订日期（必填）
   - 安装地址（必填）
5. 添加产品信息：
   - 产品名称（必填）
   - 数量（必填）
   - 单位（必填）
   - 单价（必填）
   - 备注（可选）
6. 点击"生成合同"按钮
7. 系统自动生成合同编号和合同图片

#### 方式二：从订单生成合同
1. 登录管理后台
2. 进入"订单管理"页面
3. 找到需要生成合同的订单
4. 点击该订单行的"生成合同"按钮
5. 系统会跳转到合同管理页面
6. 订单商品信息会自动预填到合同表单中
7. 补充完整客户信息后生成合同

### 合同管理操作

#### 查看合同列表
- 支持按页浏览所有合同
- 显示合同编号、客户名称、签订日期、金额等基本信息
- 支持按关联订单筛选

#### 合同操作
- **查看**：查看合同完整信息和产品明细
- **预览**：在线预览合同图片
- **下载**：下载合同图片文件到本地

## 🏗️ 技术架构

### 后端集成
- **合同数据模型**：使用 Sequelize ORM 创建了三个新表
  - `contracts`：合同主表
  - `contract_products`：合同产品明细表
  - `contract_no_sequences`：合同编号序列表
- **合同生成服务**：使用 Node.js Canvas 库替代 Python PIL 实现图像处理
- **API接口**：新增 `/api/contracts` 相关接口

### 前端集成
- **合同管理页面**：`/admin/contracts`
- **路由配置**：新增合同管理路由
- **管理员入口**：在管理员首页添加合同管理卡片
- **订单集成**：在订单管理页面添加生成合同按钮

### 数据库表结构

#### contracts 表
```sql
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractNo VARCHAR(20) NOT NULL UNIQUE,
  orderId INTEGER REFERENCES orders(id),
  clientName VARCHAR(100) NOT NULL,
  clientContact VARCHAR(20),
  clientIdCard VARCHAR(18),
  signDate DATETIME NOT NULL,
  installAddress TEXT NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  contractImagePath VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

#### contract_products 表
```sql
CREATE TABLE contract_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractId INTEGER NOT NULL REFERENCES contracts(id),
  productName VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  totalPrice DECIMAL(10,2) NOT NULL,
  remark TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

## 🔧 技术细节

### 合同编号生成规则
- 格式：`HT-YYYYMMDD-NNNN`
- 示例：`HT-20240101-0001`
- 每天从 0001 开始递增
- 使用数据库事务确保编号唯一性

### 图像生成技术
- 使用 Node.js Canvas 库进行图像处理
- 在合同模板图片上绘制文字信息
- 支持中文字体渲染
- 生成高质量 JPEG 格式图片

### 文件存储
- 合同图片存储在 `server/uploads/contracts/` 目录
- 文件名使用合同编号命名
- 支持在线预览和下载

## 📁 相关文件

### 后端文件
- `server/models/sequelize/Contract.js` - 合同数据模型
- `server/services/contractService.js` - 合同生成服务
- `server/routes/contracts.js` - 合同API路由
- `server/uploads/contract_template.jpg` - 合同模板图片

### 前端文件
- `client/src/views/ContractAdmin.vue` - 合同管理页面
- `client/src/router/index.js` - 路由配置（已更新）
- `client/src/views/AdminHome.vue` - 管理员首页（已更新）
- `client/src/views/OrderAdmin.vue` - 订单管理页面（已更新）

## 🧪 测试

### 功能测试
运行以下命令进行功能测试：
```bash
cd server
node test-contract.js
```

### API测试
使用以下 curl 命令测试 API：
```bash
# 生成合同
curl -X POST http://localhost:3000/api/contracts/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "client_name": "测试客户",
    "sign_date": "2024-01-01",
    "install_address": "测试地址",
    "products": [
      {
        "product_name": "铝合金门窗",
        "quantity": 5,
        "unit": "平方米",
        "unit_price": 650.00
      }
    ]
  }'

# 获取合同列表
curl -X GET http://localhost:3000/api/contracts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 部署说明

### 数据库迁移
在生产环境部署前，需要执行数据库同步：
```bash
npm run db:sync  # 非破坏性同步
# 或
npm run db:reset # 重置数据库（谨慎使用）
```

### 依赖安装
确保安装了新的依赖包：
```bash
npm install canvas
```

### 文件权限
确保合同存储目录有写入权限：
```bash
chmod 755 server/uploads/contracts/
```

## 📝 注意事项

1. **字体支持**：系统会自动寻找可用的中文字体，优先使用系统字体
2. **图片模板**：合同模板图片路径为 `server/uploads/contract_template.jpg`
3. **坐标调整**：如需调整文字在合同上的位置，请修改 `contractService.js` 中的 `positions` 配置
4. **性能考虑**：图像生成是CPU密集型操作，建议在生产环境中考虑使用队列处理
5. **备份重要**：合同文件建议定期备份到云存储

## 🔗 相关链接

- 原门窗合同报单系统文档：`门窗合同报单/README.md`
- 宝得利订购网站文档：`宝得利订购网站/README.md`

---

**集成完成时间**：2024年7月1日  
**版本**：v1.0.0  
**状态**：✅ 集成成功，功能正常 