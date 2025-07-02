const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const { Contract, ContractProduct, ContractNoSequence } = require('../models/sequelize');
const { sequelize } = require('../config/database');

class ContractService {
  constructor() {
    // 字体配置
    this.FONT_SIZE = {
      normal: 40,
      title: 40,
      small: 40
    };
    
    // 模板路径
    this.TEMPLATE_PATH = path.join(__dirname, '../uploads/contract_template.jpg');
    this.CONTRACTS_DIR = path.join(__dirname, '../uploads/contracts');
    
    // 确保目录存在
    if (!fs.existsSync(this.CONTRACTS_DIR)) {
      fs.mkdirSync(this.CONTRACTS_DIR, { recursive: true });
    }
    
    // 字体位置坐标（需要根据实际模板调整）
    this.positions = {
      contract_no: { x: 1650, y: 280 },
      client_name: { x: 725, y: 360 },
      sign_date: { x: 1650, y: 360 },
      products: {
        start_y: 720,
        line_height: 100,
        line_spacing: 30,
        max_lines: 3,
        columns: {
          product_name: { x: 200, y: 0 },
          quantity: { x: 725, y: 0 },
          unit: { x: 950, y: 0 },
          unit_price: { x: 1120, y: 0 },
          total_price: { x: 1370, y: 0 },
          remark: { x: 1650, y: 0 }
        }
      },
      total: { x: 320, y: 1625 },
      deposit: { x: 320, y: 1725 },
      address: { x: 420, y: 1820 }
    };
  }

  /**
   * 计算总金额
   */
  calculateTotalAmount(products) {
    return products.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  }

  /**
   * 计算定金（50%）
   */
  calculateDeposit(totalAmount) {
    return totalAmount * 0.5;
  }

  /**
   * 生成合同编号
   */
  async generateContractNo(signDate) {
    const transaction = await sequelize.transaction();
    
    try {
      const dateStr = signDate.toISOString().slice(0, 10).replace(/-/g, '');
      
      // 查找或创建当天的序号记录
      const [record, created] = await ContractNoSequence.findOrCreate({
        where: { dateStr },
        defaults: { sequence: 1 },
        transaction
      });
      
      if (!created) {
        // 如果记录已存在，增加序号
        record.sequence += 1;
        await record.save({ transaction });
      }
      
      await transaction.commit();
      
      const contractNo = `HT-${dateStr}-${record.sequence.toString().padStart(4, '0')}`;
      return contractNo;
      
    } catch (error) {
      await transaction.rollback();
      throw new Error(`生成合同编号失败: ${error.message}`);
    }
  }

  /**
   * 文本换行处理
   */
  wrapText(text, maxChars) {
    if (!text) return [''];
    
    const lines = [];
    for (let i = 0; i < text.length; i += maxChars) {
      lines.push(text.slice(i, i + maxChars));
    }
    return lines;
  }

  /**
   * 生成合同图片
   */
  async generateContractImage(data) {
    try {
      console.log('开始生成合同图片...');
      
      // 生成合同编号
      const signDate = new Date(data.sign_date);
      const contractNo = await this.generateContractNo(signDate);
      console.log(`生成合同编号: ${contractNo}`);
      
      // 加载模板图片
      const templateImage = await loadImage(this.TEMPLATE_PATH);
      
      // 创建画布
      const canvas = createCanvas(templateImage.width, templateImage.height);
      const ctx = canvas.getContext('2d');
      
      // 绘制模板图片
      ctx.drawImage(templateImage, 0, 0);
      
      // 设置字体样式
      ctx.font = `${this.FONT_SIZE.normal}px Arial`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // 计算总金额和定金
      const totalAmount = this.calculateTotalAmount(data.products);
      const depositAmount = this.calculateDeposit(totalAmount);
      
      // 绘制合同编号
      ctx.fillText(contractNo, this.positions.contract_no.x, this.positions.contract_no.y);
      
      // 绘制客户名称和签订日期
      ctx.fillText(data.client_name, this.positions.client_name.x, this.positions.client_name.y);
      ctx.fillText(data.sign_date, this.positions.sign_date.x, this.positions.sign_date.y);
      
      // 绘制产品列表
      data.products.forEach((product, index) => {
        const currentY = this.positions.products.start_y + index * this.positions.products.line_height;
        
        // 处理产品名称换行
        const productNameLines = this.wrapText(product.product_name, 11);
        const remarkLines = this.wrapText(product.remark || '', 16);
        
        // 限制最大行数
        const limitedProductNameLines = productNameLines.slice(0, this.positions.products.max_lines);
        const limitedRemarkLines = remarkLines.slice(0, this.positions.products.max_lines);
        
        // 绘制产品名称（多行）
        limitedProductNameLines.forEach((line, i) => {
          const yOffset = i * this.positions.products.line_spacing;
          ctx.fillText(
            line,
            this.positions.products.columns.product_name.x,
            currentY + yOffset
          );
        });
        
        // 绘制其他字段
        ctx.fillText(
          product.quantity.toString(),
          this.positions.products.columns.quantity.x,
          currentY
        );
        
        ctx.fillText(
          product.unit,
          this.positions.products.columns.unit.x,
          currentY
        );
        
        ctx.fillText(
          product.unit_price.toString(),
          this.positions.products.columns.unit_price.x,
          currentY
        );
        
        const productTotal = product.quantity * product.unit_price;
        ctx.fillText(
          productTotal.toString(),
          this.positions.products.columns.total_price.x,
          currentY
        );
        
        // 绘制备注（多行）
        limitedRemarkLines.forEach((line, i) => {
          const yOffset = i * this.positions.products.line_spacing;
          ctx.fillText(
            line,
            this.positions.products.columns.remark.x,
            currentY + yOffset
          );
        });
      });
      
      // 绘制总金额和定金
      ctx.fillText(`${totalAmount.toFixed(2)}元`, this.positions.total.x, this.positions.total.y);
      ctx.fillText(`${depositAmount.toFixed(2)}元`, this.positions.deposit.x, this.positions.deposit.y);
      
      // 绘制安装地址
      ctx.fillText(data.install_address, this.positions.address.x, this.positions.address.y);
      
      // 保存图片
      const outputFilename = `${contractNo}.jpg`;
      const outputPath = path.join(this.CONTRACTS_DIR, outputFilename);
      
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`合同图片已保存到: ${outputPath}`);
      
      return {
        success: true,
        contractNo,
        filename: outputFilename,
        path: outputPath,
        totalAmount,
        depositAmount
      };
      
    } catch (error) {
      console.error('生成合同图片失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 保存合同到数据库
   */
  async saveContractToDatabase(contractData, imageResult) {
    const transaction = await sequelize.transaction();
    
    try {
      // 创建合同记录
      const contract = await Contract.create({
        contractNo: imageResult.contractNo,
        orderId: contractData.order_id || null,
        clientName: contractData.client_name,
        clientContact: contractData.client_contact || null,
        clientIdCard: contractData.client_id_card || null,
        signDate: new Date(contractData.sign_date),
        installAddress: contractData.install_address,
        totalAmount: imageResult.totalAmount,
        contractImagePath: imageResult.path
      }, { transaction });
      
      // 创建产品明细
      const productPromises = contractData.products.map(product => 
        ContractProduct.create({
          contractId: contract.id,
          productName: product.product_name,
          quantity: product.quantity,
          unit: product.unit,
          unitPrice: product.unit_price,
          totalPrice: product.quantity * product.unit_price,
          remark: product.remark || ''
        }, { transaction })
      );
      
      await Promise.all(productPromises);
      await transaction.commit();
      
      console.log(`合同已保存到数据库，ID: ${contract.id}`);
      return contract;
      
    } catch (error) {
      await transaction.rollback();
      throw new Error(`保存合同到数据库失败: ${error.message}`);
    }
  }

  /**
   * 生成完整合同（图片 + 数据库）
   */
  async generateContract(contractData) {
    try {
      // 生成合同图片
      const imageResult = await this.generateContractImage(contractData);
      
      if (!imageResult.success) {
        throw new Error(imageResult.error);
      }
      
      // 保存到数据库
      const contract = await this.saveContractToDatabase(contractData, imageResult);
      
      return {
        success: true,
        contract,
        imageResult
      };
      
    } catch (error) {
      console.error('生成合同失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取合同列表
   */
  async getContracts(options = {}) {
    try {
      const { page = 1, limit = 20, orderId } = options;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (orderId) {
        whereClause.orderId = orderId;
      }
      
      const result = await Contract.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ContractProduct,
            as: 'products'
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });
      
      return {
        success: true,
        contracts: result.rows,
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit)
      };
      
    } catch (error) {
      console.error('获取合同列表失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取合同详情
   */
  async getContract(contractId) {
    try {
      const contract = await Contract.findByPk(contractId, {
        include: [
          {
            model: ContractProduct,
            as: 'products'
          }
        ]
      });
      
      if (!contract) {
        return {
          success: false,
          error: '合同不存在'
        };
      }
      
      return {
        success: true,
        contract
      };
      
    } catch (error) {
      console.error('获取合同详情失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 删除合同
   */
  async deleteContract(contractId) {
    const transaction = await sequelize.transaction();
    
    try {
      // 查找合同
      const contract = await Contract.findByPk(contractId, {
        include: [
          {
            model: ContractProduct,
            as: 'products'
          }
        ]
      });
      
      if (!contract) {
        await transaction.rollback();
        return {
          success: false,
          error: '合同不存在'
        };
      }
      
      // 删除合同产品明细（由于设置了CASCADE，会自动删除）
      await ContractProduct.destroy({
        where: { contractId: contractId },
        transaction
      });
      
      // 删除合同主记录
      await contract.destroy({ transaction });
      
      await transaction.commit();
      
      console.log(`合同已从数据库删除，ID: ${contractId}`);
      return {
        success: true
      };
      
    } catch (error) {
      await transaction.rollback();
      console.error('删除合同失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ContractService(); 