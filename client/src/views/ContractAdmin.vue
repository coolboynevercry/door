<template>
  <div class="contract-admin">
    <div class="header">
      <h1>合同管理</h1>
      <button @click="showGenerateModal" class="btn-primary">
        生成新合同
      </button>
    </div>

    <!-- 合同列表 -->
    <div class="contracts-table">
      <h2>合同列表</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>合同编号</th>
              <th>客户名称</th>
              <th>签订日期</th>
              <th>合同金额</th>
              <th>关联订单</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contract in contracts" :key="contract.id">
              <td>{{ contract.contractNo }}</td>
              <td>{{ contract.clientName }}</td>
              <td>{{ formatDate(contract.signDate) }}</td>
              <td>￥{{ contract.totalAmount }}</td>
              <td>
                <span v-if="contract.orderId">订单 #{{ contract.orderId }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ formatDateTime(contract.createdAt) }}</td>
              <td>
                <button @click="viewContract(contract)" class="btn-info">查看</button>
                <button @click="previewContract(contract)" class="btn-secondary">预览</button>
                <button @click="downloadContract(contract)" class="btn-success">下载</button>
                <button @click="confirmDelete(contract)" class="btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="changePage(page - 1)" 
          :disabled="page <= 1"
          class="btn-page"
        >
          上一页
        </button>
        <span>第 {{ page }} 页，共 {{ totalPages }} 页</span>
        <button 
          @click="changePage(page + 1)" 
          :disabled="page >= totalPages"
          class="btn-page"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 生成合同模态框 -->
    <div v-if="showGenerate" class="modal-overlay" @click="closeGenerateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>生成新合同</h3>
          <button @click="closeGenerateModal" class="btn-close">&times;</button>
        </div>
        
        <form @submit.prevent="generateContract" class="contract-form">
          <div class="form-row">
            <div class="form-group">
              <label>客户名称 *</label>
              <input 
                v-model="contractForm.client_name" 
                type="text" 
                required 
                placeholder="请输入客户名称"
              />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input 
                v-model="contractForm.client_contact" 
                type="text" 
                placeholder="请输入联系电话"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>身份证号</label>
              <input 
                v-model="contractForm.client_id_card" 
                type="text" 
                placeholder="请输入身份证号"
              />
            </div>
            <div class="form-group">
              <label>签订日期 *</label>
              <input 
                v-model="contractForm.sign_date" 
                type="date" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label>安装地址 *</label>
            <textarea 
              v-model="contractForm.install_address" 
              required 
              placeholder="请输入安装地址"
              rows="3"
            ></textarea>
          </div>

          <h4>产品信息</h4>
          <div class="products-section">
            <div class="product-item" v-for="(product, index) in contractForm.products" :key="index">
              <div class="product-row">
                <div class="form-group">
                  <label>产品名称</label>
                  <input 
                    v-model="product.product_name" 
                    type="text" 
                    required 
                    placeholder="产品名称"
                  />
                </div>
                <div class="form-group">
                  <label>数量</label>
                  <input 
                    v-model.number="product.quantity" 
                    type="number" 
                    required 
                    min="1"
                    placeholder="数量"
                  />
                </div>
                <div class="form-group">
                  <label>单位</label>
                  <input 
                    v-model="product.unit" 
                    type="text" 
                    required 
                    placeholder="单位"
                  />
                </div>
                <div class="form-group">
                  <label>单价</label>
                  <input 
                    v-model.number="product.unit_price" 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    placeholder="单价"
                  />
                </div>
                <div class="form-group">
                  <label>备注</label>
                  <input 
                    v-model="product.remark" 
                    type="text" 
                    placeholder="备注"
                  />
                </div>
                <button 
                  type="button" 
                  @click="removeProduct(index)" 
                  class="btn-danger"
                  v-if="contractForm.products.length > 1"
                >
                  删除
                </button>
              </div>
            </div>
            <button type="button" @click="addProduct" class="btn-secondary">
              添加产品
            </button>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeGenerateModal" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary" :disabled="generating">
              {{ generating ? '生成中...' : '生成合同' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 合同预览模态框 -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreviewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>合同预览 - {{ previewContractData.contractNo }}</h3>
          <button @click="closePreviewModal" class="btn-close">&times;</button>
        </div>
        
        <div class="preview-content">
          <div class="preview-image-container">
            <img 
              :src="`/api/contracts/preview/${previewContractData.contractNo}.jpg`" 
              alt="合同预览"
              class="contract-image"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="downloadContract(previewContractData)" class="btn-primary">
            下载合同
          </button>
          <button @click="closePreviewModal" class="btn-secondary">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 合同详情模态框 -->
    <div v-if="showDetail" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>合同详情 - {{ detailContract.contractNo }}</h3>
          <button @click="closeDetailModal" class="btn-close">&times;</button>
        </div>
        
        <div class="detail-content">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-row">
              <span class="label">合同编号：</span>
              <span>{{ detailContract.contractNo }}</span>
            </div>
            <div class="detail-row">
              <span class="label">客户名称：</span>
              <span>{{ detailContract.clientName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">联系电话：</span>
              <span>{{ detailContract.clientContact || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">身份证号：</span>
              <span>{{ detailContract.clientIdCard || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">签订日期：</span>
              <span>{{ formatDate(detailContract.signDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">安装地址：</span>
              <span>{{ detailContract.installAddress }}</span>
            </div>
            <div class="detail-row">
              <span class="label">合同金额：</span>
              <span>￥{{ detailContract.totalAmount }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>产品明细</h4>
            <table class="products-table">
              <thead>
                <tr>
                  <th>产品名称</th>
                  <th>数量</th>
                  <th>单位</th>
                  <th>单价</th>
                  <th>总价</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in detailContract.products" :key="product.id">
                  <td>{{ product.productName }}</td>
                  <td>{{ product.quantity }}</td>
                  <td>{{ product.unit }}</td>
                  <td>￥{{ product.unitPrice }}</td>
                  <td>￥{{ product.totalPrice }}</td>
                  <td>{{ product.remark || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="previewContract(detailContract)" class="btn-info">
            预览合同
          </button>
          <button @click="downloadContract(detailContract)" class="btn-primary">
            下载合同
          </button>
          <button @click="closeDetailModal" class="btn-secondary">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
          <button @click="closeDeleteModal" class="btn-close">&times;</button>
        </div>
        
        <div class="delete-content">
          <div class="warning-icon">
            <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z">
              </path>
            </svg>
          </div>
          <div class="warning-text">
            <p><strong>确定要删除此合同吗？</strong></p>
            <p class="contract-info">
              合同编号：<span class="highlight">{{ contractToDelete?.contractNo }}</span><br>
              客户名称：<span class="highlight">{{ contractToDelete?.clientName }}</span>
            </p>
            <p class="warning-note">此操作不可撤销，请谨慎操作！</p>
            <div class="confirm-input-section">
              <label for="confirmContractNo">请输入合同编号以确认删除：</label>
              <input 
                id="confirmContractNo"
                v-model="confirmContractNo" 
                type="text" 
                placeholder="请输入合同编号"
                class="confirm-input"
                :class="{ 'error': confirmContractNoError }"
              />
              <p v-if="confirmContractNoError" class="error-message">{{ confirmContractNoError }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">取消</button>
          <button @click="deleteContract" class="btn-danger" :disabled="deleting || !isDeleteConfirmValid">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 从订单生成合同的快速入口 -->
    <div class="quick-actions" v-if="orderId">
      <h2>从订单生成合同</h2>
      <p>订单ID: {{ orderId }}</p>
      <button @click="generateFromOrder" class="btn-primary">
        基于此订单生成合同
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContractAdmin',
  data() {
    return {
      contracts: [],
      page: 1,
      totalPages: 1,
      loading: false,
      showGenerate: false,
      showPreview: false,
      showDetail: false,
      generating: false,
      previewContractData: null,
      detailContract: null,
      orderId: null, // 从URL参数获取
      contractForm: {
        client_name: '',
        client_contact: '',
        client_id_card: '',
        sign_date: '',
        install_address: '',
        products: [
          {
            product_name: '',
            quantity: 1,
            unit: '套',
            unit_price: 0,
            remark: ''
          }
        ]
      },
      showDeleteConfirm: false,
      contractToDelete: null,
      deleting: false,
      confirmContractNo: '',
      confirmContractNoError: null
    }
  },
  async mounted() {
    // 检查登录状态
    if (!this.checkAuth()) {
      return;
    }
    
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    this.orderId = urlParams.get('orderId');
    
    await this.loadContracts();
  },
  computed: {
    isDeleteConfirmValid() {
      return this.confirmContractNo === this.contractToDelete?.contractNo;
    }
  },
  methods: {
    // 检查登录状态
    checkAuth() {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        this.$router.push('/admin/login');
        return false;
      }
      return true;
    },

    async loadContracts() {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          page: this.page,
          limit: 10
        });
        
        if (this.orderId) {
          params.append('orderId', this.orderId);
        }

        const response = await fetch(`/api/contracts?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            this.contracts = result.data.contracts;
            this.totalPages = result.data.totalPages;
          } else {
            alert('获取合同列表失败：' + result.message);
          }
        } else if (response.status === 401 || response.status === 403) {
          // Token过期或无权限，跳转到登录页
          localStorage.removeItem('admin_token');
          this.$router.push('/admin/login');
        } else {
          alert('获取合同列表失败，请稍后重试');
        }
      } catch (error) {
        console.error('获取合同列表失败:', error);
        alert('获取合同列表失败');
      } finally {
        this.loading = false;
      }
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage;
        this.loadContracts();
      }
    },

    showGenerateModal() {
      this.showGenerate = true;
    },

    closeGenerateModal() {
      this.showGenerate = false;
      this.resetForm();
    },

    resetForm() {
      this.contractForm = {
        client_name: '',
        client_contact: '',
        client_id_card: '',
        sign_date: '',
        install_address: '',
        products: [
          {
            product_name: '',
            quantity: 1,
            unit: '套',
            unit_price: 0,
            remark: ''
          }
        ]
      };
    },

    addProduct() {
      this.contractForm.products.push({
        product_name: '',
        quantity: 1,
        unit: '套',
        unit_price: 0,
        remark: ''
      });
    },

    removeProduct(index) {
      if (this.contractForm.products.length > 1) {
        this.contractForm.products.splice(index, 1);
      }
    },

    async generateContract() {
      this.generating = true;
      
      try {
        const response = await fetch('/api/contracts/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          },
          body: JSON.stringify({
            ...this.contractForm,
            order_id: this.orderId
          })
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`合同生成成功！合同编号：${result.data.contractNo}`);
          this.closeGenerateModal();
          await this.loadContracts();
        } else {
          alert('生成合同失败：' + result.message);
        }
      } catch (error) {
        console.error('生成合同失败:', error);
        alert('生成合同失败');
      } finally {
        this.generating = false;
      }
    },

    async viewContract(contract) {
      try {
        const response = await fetch(`/api/contracts/${contract.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });

        const result = await response.json();
        
        if (result.success) {
          this.detailContract = result.data;
          this.showDetail = true;
        } else {
          alert('获取合同详情失败：' + result.message);
        }
      } catch (error) {
        console.error('获取合同详情失败:', error);
        alert('获取合同详情失败');
      }
    },

    closeDetailModal() {
      this.showDetail = false;
      this.detailContract = null;
    },

    previewContract(contract) {
      this.previewContractData = contract;
      this.showPreview = true;
    },

    closePreviewModal() {
      this.showPreview = false;
      this.previewContractData = null;
    },

    downloadContract(contract) {
      const filename = `${contract.contractNo}.jpg`;
      
      // 使用fetch下载文件以便传递认证头
      fetch(`/api/contracts/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.blob();
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('admin_token');
          this.$router.push('/admin/login');
          throw new Error('认证失败');
        } else {
          throw new Error('下载失败');
        }
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        if (error.message !== '认证失败') {
          alert('下载合同失败');
        }
      });
    },

    async generateFromOrder() {
      if (!this.orderId) {
        alert('未找到订单信息');
        return;
      }

      try {
        // 获取订单详情
        const response = await fetch(`/api/orders/${this.orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const order = result.data;
            
            // 自动填充客户信息
            this.contractForm.client_name = order.customerName || '';
            this.contractForm.client_contact = order.phone || '';
            this.contractForm.install_address = order.address || '';
            
            // 设置默认签订日期为今天
            const today = new Date();
            this.contractForm.sign_date = today.toISOString().split('T')[0];
            
            // 自动填充产品信息
            if (order.items && order.items.length > 0) {
              this.contractForm.products = order.items.map(item => ({
                product_name: item.productName || '',
                quantity: item.quantity || 1,
                unit: item.priceUnit || '套',
                unit_price: item.price || 0,
                remark: item.specification || item.category || ''
              }));
            }
            
            // 显示表单
            this.showGenerateModal();
          } else {
            alert('获取订单信息失败：' + (result.message || '未知错误'));
          }
        } else {
          alert('获取订单信息失败，请稍后重试');
        }
      } catch (error) {
        console.error('获取订单信息失败:', error);
        alert('获取订单信息失败');
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN');
    },

    formatDateTime(dateString) {
      return new Date(dateString).toLocaleString('zh-CN');
    },

    confirmDelete(contract) {
      this.contractToDelete = contract;
      this.confirmContractNo = '';
      this.confirmContractNoError = null;
      this.showDeleteConfirm = true;
    },

    closeDeleteModal() {
      this.showDeleteConfirm = false;
      this.contractToDelete = null;
      this.confirmContractNo = '';
      this.confirmContractNoError = null;
    },

    async deleteContract() {
      // 验证合同编号
      if (this.confirmContractNo !== this.contractToDelete.contractNo) {
        this.confirmContractNoError = '合同编号不匹配，请重新输入';
        return;
      }

      this.confirmContractNoError = null;
      this.deleting = true;
      
      try {
        const response = await fetch(`/api/contracts/${this.contractToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });

        const result = await response.json();
        
        if (result.success) {
          alert('合同删除成功');
          this.closeDeleteModal();
          await this.loadContracts();
        } else {
          alert('删除合同失败：' + result.message);
        }
      } catch (error) {
        console.error('删除合同失败:', error);
        alert('删除合同失败');
      } finally {
        this.deleting = false;
      }
    },
  }
}
</script>

<style scoped>
.contract-admin {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  margin: 0;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-info {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
}

.btn-info:hover {
  background: #138496;
}

.btn-success {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
}

.btn-danger:hover {
  background: #c82333;
}

.contracts-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.contracts-table h2 {
  padding: 20px;
  margin: 0;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.btn-page {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 1000px;
}

.modal-small {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.contract-form {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.products-section {
  margin-top: 20px;
}

.product-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.product-row {
  display: flex;
  gap: 15px;
  align-items: end;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-content {
  padding: 20px;
  text-align: center;
}

.preview-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 500px;
  overflow: hidden;
}

.contract-image {
  max-width: 100%;
  max-height: 500px;
  width: auto;
  height: auto;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.detail-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-row .label {
  font-weight: 600;
  min-width: 100px;
  color: #666;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.products-table th,
.products-table td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.products-table th {
  background: #f8f9fa;
}

.quick-actions {
  background: #e7f3ff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
}

.quick-actions h2 {
  margin-top: 0;
  color: #007bff;
}

.delete-content {
  padding: 20px;
  text-align: center;
}

.warning-icon {
  margin-bottom: 20px;
}

.warning-icon svg {
  width: 48px;
  height: 48px;
  color: #dc3545;
  margin: 0 auto;
}

.warning-text {
  margin-bottom: 20px;
}

.warning-text p {
  margin-bottom: 15px;
  color: #333;
}

.contract-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #ffc107;
  text-align: left;
  margin: 15px 0;
}

.highlight {
  font-weight: 600;
  color: #dc3545;
}

.warning-note {
  font-size: 14px;
  color: #dc3545;
  font-style: italic;
}

.confirm-input-section {
  margin-top: 20px;
}

.confirm-input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.confirm-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.confirm-input:focus {
  outline: none;
  border-color: #007bff;
}

.confirm-input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}
</style> 