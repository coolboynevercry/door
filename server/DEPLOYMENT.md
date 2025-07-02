# 🚀 生产环境部署指南

## 快速部署

### 使用PM2部署（推荐）

1. **安装PM2**
   ```bash
   npm install -g pm2
   ```

2. **创建生产配置**
   ```bash
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'baodeli-api',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   EOF
   ```

3. **启动服务**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 startup
   pm2 save
   ```

### 使用Docker部署

1. **创建Dockerfile**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **构建并运行**
   ```bash
   docker build -t baodeli-api .
   docker run -d -p 3000:3000 --name baodeli-api baodeli-api
   ```

## 安全配置

### 1. Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL证书（Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 防火墙设置
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP  
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 监控维护

### 健康检查
```bash
# 检查服务状态
curl http://localhost:3000/health

# PM2监控
pm2 monit

# 查看日志
pm2 logs baodeli-api
```

### 更新应用
```bash
# 拉取新代码
git pull origin main

# 安装依赖
npm ci --only=production

# 重启服务
pm2 reload baodeli-api
```

## 故障排除

### 常见问题
1. **端口被占用**: `sudo netstat -tlnp | grep :3000`
2. **内存不足**: `pm2 restart baodeli-api`
3. **日志查看**: `pm2 logs baodeli-api`

### 备份恢复
```bash
# 备份代码
tar -czf backup-$(date +%Y%m%d).tar.gz .

# 恢复代码
tar -xzf backup-YYYYMMDD.tar.gz
```

---

**详细配置请参考 README.md 文档** 📚 