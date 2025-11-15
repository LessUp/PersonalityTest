# 部署文档

## 部署概述

本文档提供详细的部署指南，包括开发环境、测试环境和生产环境的部署流程。

## 环境要求

### 开发环境

- **Node.js**: >= 18.x LTS
- **npm/pnpm/yarn**: 最新稳定版
- **Docker**: >= 20.x (可选)
- **Git**: >= 2.x

### 生产环境

- **Node.js**: 18.x LTS 或 20.x LTS
- **数据库**: PostgreSQL >= 14.x / MongoDB >= 6.x
- **缓存**: Redis >= 7.x
- **反向代理**: Nginx >= 1.24.x
- **SSL证书**: Let's Encrypt 或商业证书
- **域名**: 已配置DNS

## 环境变量配置

### 开发环境 (.env.development)

```bash
# 应用配置
NODE_ENV=development
APP_NAME=MyApp
APP_PORT=3000
APP_URL=http://localhost:3000

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=myapp_dev

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-dev-secret-key
JWT_EXPIRES_IN=7d

# 日志级别
LOG_LEVEL=debug

# 外部服务
EMAIL_SERVICE=smtp.mailtrap.io
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 生产环境 (.env.production)

```bash
# 应用配置
NODE_ENV=production
APP_NAME=MyApp
APP_PORT=3000
APP_URL=https://api.example.com

# 数据库配置（使用强密码）
DATABASE_URL=postgresql://user:strong_password@db.example.com:5432/myapp_prod
DB_SSL=true

# Redis配置
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=strong_redis_password
REDIS_TLS=true

# JWT配置（使用强密钥）
JWT_SECRET=your-production-secret-key-min-32-chars
JWT_EXPIRES_IN=1d

# 日志级别
LOG_LEVEL=info

# 外部服务
EMAIL_SERVICE=smtp.gmail.com
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=app_specific_password

# 文件存储（推荐使用对象存储）
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_BUCKET=myapp-uploads
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# 监控
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Docker部署

### Dockerfile

#### 前端 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM nginx:alpine

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### 后端 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖（包括devDependencies用于构建）
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/myapp
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass password
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

## Nginx配置

### nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name example.com www.example.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS服务器
    server {
        listen 443 ssl http2;
        server_name example.com www.example.com;

        # SSL证书
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000" always;

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            
            # 缓存静态资源
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API代理
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            limit_conn addr 10;

            proxy_pass http://backend:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket代理
        location /ws/ {
            proxy_pass http://backend:3000/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 云平台部署

### Vercel部署（前端）

1. 连接GitHub仓库
2. 配置构建命令：
   ```bash
   pnpm run build
   ```
3. 配置输出目录：`dist` 或 `build`
4. 设置环境变量
5. 点击部署

### Railway部署（全栈）

1. 创建新项目
2. 连接GitHub仓库
3. 添加服务：
   - Web服务（后端）
   - PostgreSQL数据库
   - Redis
4. 配置环境变量
5. 自动部署

### AWS部署

#### EC2实例

```bash
# 1. 连接到EC2实例
ssh -i "your-key.pem" ubuntu@your-instance-ip

# 2. 安装依赖
sudo apt update
sudo apt install -y nodejs npm docker.io docker-compose nginx

# 3. 克隆代码
git clone <repository-url>
cd project

# 4. 配置环境变量
cp .env.example .env.production
nano .env.production

# 5. 使用Docker Compose启动
docker-compose -f docker-compose.prod.yml up -d

# 6. 配置Nginx
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx

# 7. 配置SSL证书（Let's Encrypt）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

#### ECS（Docker容器）

1. 创建ECR仓库并推送镜像
2. 创建ECS集群
3. 定义任务定义
4. 创建服务
5. 配置负载均衡器
6. 配置自动扩展

### DigitalOcean App Platform

1. 连接GitHub仓库
2. 选择分支和目录
3. 配置构建和运行命令
4. 添加数据库和Redis
5. 设置环境变量
6. 部署应用

## CI/CD配置

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm run test
      
      - name: Run lint
        run: pnpm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker tag myapp:${{ github.sha }} myapp:latest
      
      - name: Push to Docker Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push myapp:${{ github.sha }}
          docker push myapp:latest
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

## 数据库迁移

### Prisma迁移

```bash
# 开发环境
pnpm prisma migrate dev --name init

# 生产环境
pnpm prisma migrate deploy
```

### 备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="myapp"

# 数据库备份
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 保留最近30天的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# 上传到S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://mybucket/backups/
```

## 监控和日志

### PM2进程管理

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
  }]
};
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 reload api

# 监控
pm2 monit
```

## 回滚策略

### Docker回滚

```bash
# 查看历史版本
docker images myapp

# 回滚到指定版本
docker-compose down
docker tag myapp:previous-version myapp:latest
docker-compose up -d
```

### 数据库回滚

```bash
# Prisma
pnpm prisma migrate resolve --rolled-back <migration-name>

# 手动SQL
psql -U postgres myapp < backup.sql
```

## 性能优化清单

- [ ] 启用Gzip/Brotli压缩
- [ ] 配置CDN加速静态资源
- [ ] 数据库索引优化
- [ ] Redis缓存热点数据
- [ ] 启用HTTP/2
- [ ] 配置负载均衡
- [ ] 代码分割和懒加载
- [ ] 图片优化和WebP格式

## 安全检查清单

- [ ] 使用HTTPS
- [ ] 配置防火墙
- [ ] 定期更新依赖
- [ ] 环境变量加密
- [ ] SQL注入防护
- [ ] XSS防护
- [ ] CSRF防护
- [ ] 限流和防DDoS
- [ ] 定期备份数据
- [ ] 日志监控和告警

## 故障排查

### 常见问题

1. **容器无法启动**
   ```bash
   docker logs <container-id>
   docker-compose logs backend
   ```

2. **数据库连接失败**
   - 检查数据库服务是否运行
   - 验证连接字符串
   - 检查网络配置

3. **Nginx 502错误**
   - 检查后端服务是否运行
   - 查看Nginx错误日志
   - 验证代理配置

4. **内存溢出**
   - 增加容器内存限制
   - 优化代码内存使用
   - 检查内存泄漏

---

**建议**: 在首次部署前进行充分测试，建议先在测试环境完整走一遍部署流程。
