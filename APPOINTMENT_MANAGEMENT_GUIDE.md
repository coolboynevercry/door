# 宝得利门窗订购网站 - 预约管理模块

## 功能概述

预约管理模块为宝得利门窗店提供了完整的客户预约管理解决方案，包含**测量预约管理**和**安装预约管理**两大核心功能。管理员可以通过该模块高效地安排和跟踪客户的测量和安装服务。

## 主要功能

### 1. 测量预约管理
- 📋 **预约列表管理**: 查看所有测量预约订单
- ⏰ **预约时间安排**: 为客户订单安排具体的测量时间
- ✅ **测量完成记录**: 记录测量完成情况和相关备注
- 🔍 **筛选功能**: 支持按状态、日期筛选预约订单
- 📊 **状态追踪**: 实时显示预约状态（待安排/已安排/已完成）

### 2. 安装预约管理
- 🏠 **安装预约列表**: 管理所有需要安装的订单
- 📅 **安装时间安排**: 为已测量完成的订单安排安装时间
- ✅ **安装完成确认**: 记录安装完成情况
- 📋 **前置条件检查**: 确保只有测量完成的订单才能安排安装
- 🔄 **状态同步**: 自动更新订单状态至已完成

### 3. 统计仪表板
- 📈 **今日预约统计**: 显示今日测量和安装预约数量
- ⏳ **待处理统计**: 显示待安排的测量和安装数量
- 🎯 **一目了然**: 实时掌握预约工作量和处理进度

## 技术架构

### 后端 API 设计

#### 统计接口
```
GET /api/appointments/statistics
```
获取预约统计数据，包含今日预约数和待处理数量。

#### 测量预约接口
```
GET /api/appointments/measurements
POST /api/appointments/measurements/:orderId/schedule
POST /api/appointments/measurements/:orderId/complete
```

#### 安装预约接口
```
GET /api/appointments/installations
POST /api/appointments/installations/:orderId/schedule
POST /api/appointments/installations/:orderId/complete
```

### 数据库设计

利用现有 `orders` 表的预约相关字段：
- `measurementScheduled`: 测量预约时间
- `measurementCompleted`: 测量完成时间
- `installationScheduled`: 安装预约时间
- `installationCompleted`: 安装完成时间
- `status`: 订单状态（pending/measuring/measured/producing/installing/completed/cancelled）

### 前端组件

**AppointmentAdmin.vue**: 预约管理主页面
- 响应式设计，支持移动端访问
- 标签页切换（测量预约/安装预约）
- 统计卡片展示
- 筛选和分页功能
- 模态框操作界面

## 业务流程

### 测量预约流程
1. **订单创建** → 客户下单后，订单状态为 `pending`
2. **安排测量** → 管理员为订单安排测量时间，状态变为 `measuring`
3. **完成测量** → 测量完成后记录，状态变为 `measured`

### 安装预约流程
1. **测量完成** → 只有测量完成的订单才能安排安装
2. **安排安装** → 管理员安排安装时间，状态变为 `installing`
3. **安装完成** → 安装完成后，订单状态变为 `completed`

## 使用指南

### 访问方式
1. 管理员登录后台：`http://localhost:5173/admin/login`
2. 进入管理员首页：`http://localhost:5173/admin`
3. 点击"预约管理"卡片：`http://localhost:5173/admin/appointments`

### 操作说明

#### 1. 查看统计信息
- 页面顶部显示4个统计卡片
- 实时显示今日预约数和待处理数量
- 不同颜色区分不同类型的数据

#### 2. 测量预约管理
- 点击"测量预约管理"标签
- 使用筛选器按状态或日期筛选订单
- 对待安排的订单点击"安排预约"按钮
- 填写预约时间和备注信息
- 对已安排的预约点击"完成测量"记录完成情况

#### 3. 安装预约管理
- 点击"安装预约管理"标签
- 系统只显示测量已完成的订单
- 对待安排的订单点击"安排预约"按钮
- 对已安排的安装点击"完成安装"记录完成情况

#### 4. 筛选和搜索
- **状态筛选**: 全部状态/待安排/已安排/已完成
- **日期筛选**: 选择特定日期查看预约
- **重置筛选**: 一键清除所有筛选条件

#### 5. 分页浏览
- 支持分页显示，每页显示20条记录
- 页面底部显示分页导航

## 权限控制

### 管理员权限
- 所有预约管理功能需要管理员权限
- 使用JWT token进行身份验证
- 支持token过期自动跳转登录

### 登录凭据
- 用户名：`admin`
- 密码：`123456`

## API 测试示例

### 1. 管理员登录
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 2. 获取预约统计
```bash
curl -X GET http://localhost:3000/api/appointments/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 获取测量预约列表
```bash
curl -X GET http://localhost:3000/api/appointments/measurements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 安排测量预约
```bash
curl -X POST http://localhost:3000/api/appointments/measurements/1/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"scheduledTime":"2024-01-01T10:00:00","notes":"客户要求上午时间"}'
```

## 状态码说明

### 订单状态枚举
- `pending`: 待处理
- `measuring`: 测量中
- `measured`: 已测量
- `producing`: 生产中
- `installing`: 安装中  
- `completed`: 已完成
- `cancelled`: 已取消

### HTTP 状态码
- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 未授权/Token过期
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 特性优势

### 1. 用户体验优化
- 🎨 现代化界面设计，使用 Tailwind CSS
- 📱 响应式布局，支持移动端操作
- ⚡ 实时数据更新，无需手动刷新
- 🔔 操作反馈提示，明确操作结果

### 2. 数据管理高效
- 📊 统计数据一目了然
- 🔍 灵活的筛选和搜索功能
- 📄 分页显示，处理大量数据
- 💾 完整的操作记录和备注

### 3. 业务流程严谨
- ✅ 严格的业务流程控制
- 🔒 权限验证保证数据安全
- 📝 详细的操作日志记录
- 🔄 状态自动同步更新

### 4. 技术架构稳定
- 🏗️ RESTful API 设计规范
- 🔐 JWT Token 身份验证
- 💾 SQLite 数据库存储
- 🎯 错误处理机制完善

## 扩展功能建议

### 1. 通知提醒
- 预约时间临近时的短信/微信提醒
- 客户确认预约的反馈机制
- 预约变更的通知系统

### 2. 日历视图
- 预约日历视图展示
- 工作人员排班管理
- 时间冲突检测

### 3. 客户端功能
- 客户可查看自己的预约状态
- 客户可申请预约时间变更
- 预约进度跟踪

### 4. 数据分析
- 预约完成率统计
- 服务时长分析
- 客户满意度调查

## 故障排除

### 常见问题

#### 1. API 返回 401 错误
**原因**: Token过期或无效
**解决**: 重新登录获取新的Token

#### 2. 预约安排失败
**原因**: 订单状态不符合要求
**解决**: 检查订单当前状态，确保符合业务流程

#### 3. 数据不显示
**原因**: 权限不足或网络连接问题
**解决**: 检查管理员权限和网络连接

#### 4. 页面加载缓慢
**原因**: 数据量过大或服务器性能问题
**解决**: 使用筛选功能减少数据量，优化查询条件

### 调试方法
1. 使用浏览器开发者工具查看网络请求
2. 检查控制台错误信息
3. 验证API响应数据格式
4. 确认JWT Token的有效性

## 版本信息

- **版本**: v1.0.0
- **更新时间**: 2024年12月
- **兼容性**: 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）
- **依赖**: Vue 3, Tailwind CSS, Express.js, Sequelize

---

**开发团队**: 宝得利门窗技术团队  
**技术支持**: 如有问题请联系系统管理员  
**文档更新**: 本文档将随功能更新而更新 