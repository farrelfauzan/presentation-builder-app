# Deployment Guide - Digital Ocean with Docker

This guide covers deploying the Presentation Builder App to a Digital Ocean Droplet using Docker Compose, with Nginx as a reverse proxy and MinIO for file storage.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Docker Configuration](#docker-configuration)
4. [Digital Ocean Setup](#digital-ocean-setup)
5. [Domain & SSL Setup](#domain--ssl-setup)
6. [MinIO Configuration](#minio-configuration)
7. [Deployment Steps](#deployment-steps)
8. [Maintenance](#maintenance)

---

## Prerequisites

- Digital Ocean account
- Domain name (e.g., `farrel-space.online`)
- Docker & Docker Compose installed locally
- SSH key pair

---

## Project Structure

```
presentation-builder-app/
├── apps/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   └── .env.production
├── docker-compose.yml
├── docker-compose.prod.yml
└── docs/
    └── DEPLOYMENT.md
```

---

## Docker Configuration

### Backend Dockerfile

Create `apps/backend/Dockerfile`:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY libs/package.json ./libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm nx run backend:prisma-generate

# Build the application
RUN pnpm nx build backend --configuration=production

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built assets
COPY --from=builder /app/dist/apps/backend ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/src/app/prisma ./prisma

# Set environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile

Create `apps/frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/package.json ./libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
RUN pnpm nx build frontend --configuration=production

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3001

CMD ["node", "apps/frontend/server.js"]
```

### Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: presentation-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    container_name: presentation-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Backend API
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    container_name: presentation-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      HOST: 0.0.0.0
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public
      MINIO_HOST: minio
      MINIO_PORT: 9000
      MINIO_USE_SSL: "false"
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET_NAME: ${MINIO_BUCKET_NAME}
      MINIO_PUBLIC_URL: ${MINIO_PUBLIC_URL}
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    container_name: presentation-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: presentation-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot_data:/var/www/certbot:ro
      - ssl_certs:/etc/letsencrypt:ro
    depends_on:
      - backend
      - frontend
      - minio
    networks:
      - app-network

  # Certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: presentation-certbot
    volumes:
      - certbot_data:/var/www/certbot
      - ssl_certs:/etc/letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  minio_data:
  certbot_data:
  ssl_certs:

networks:
  app-network:
    driver: bridge
```

### Nginx Configuration

Create `docker/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Upstream servers
    upstream backend {
        server backend:3000;
    }

    upstream frontend {
        server frontend:3001;
    }

    upstream minio_api {
        server minio:9000;
    }

    upstream minio_console {
        server minio:9001;
    }

    # HTTP - Redirect to HTTPS
    server {
        listen 80;
        server_name farrel-space.online api.farrel-space.online storage.farrel-space.online minio.farrel-space.online;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Frontend (Main Domain)
    server {
        listen 443 ssl http2;
        server_name farrel-space.online;

        ssl_certificate /etc/letsencrypt/live/farrel-space.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/farrel-space.online/privkey.pem;
        include /etc/nginx/ssl-params.conf;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.farrel-space.online;

        ssl_certificate /etc/letsencrypt/live/farrel-space.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/farrel-space.online/privkey.pem;
        include /etc/nginx/ssl-params.conf;

        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # MinIO Storage (Public Access for Files)
    server {
        listen 443 ssl http2;
        server_name storage.farrel-space.online;

        ssl_certificate /etc/letsencrypt/live/farrel-space.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/farrel-space.online/privkey.pem;
        include /etc/nginx/ssl-params.conf;

        # Ignore auth header for public bucket access
        ignore_invalid_headers off;
        client_max_body_size 100M;
        proxy_buffering off;

        location / {
            proxy_pass http://minio_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection '';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static assets
            proxy_cache_valid 200 1d;
            add_header Cache-Control "public, max-age=86400";
        }
    }

    # MinIO Console (Admin)
    server {
        listen 443 ssl http2;
        server_name minio.farrel-space.online;

        ssl_certificate /etc/letsencrypt/live/farrel-space.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/farrel-space.online/privkey.pem;
        include /etc/nginx/ssl-params.conf;

        ignore_invalid_headers off;
        client_max_body_size 100M;
        proxy_buffering off;

        location / {
            proxy_pass http://minio_console;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Create `docker/nginx/ssl-params.conf`:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

### Environment Variables

Create `docker/.env.production`:

```env
# Database
DB_USER=presentation_user
DB_PASSWORD=your_secure_password_here
DB_NAME=presentation_builder

# MinIO
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key_min_8_chars
MINIO_BUCKET_NAME=presentation-builder
MINIO_PUBLIC_URL=https://storage.farrel-space.online

# Frontend
NEXT_PUBLIC_API_URL=https://api.farrel-space.online/api/v1
```

---

## Digital Ocean Setup

### 1. Create a Droplet

```bash
# Recommended specs:
# - Ubuntu 24.04 LTS
# - 2GB RAM / 1 CPU (minimum) or 4GB RAM / 2 CPU (recommended)
# - 50GB SSD
# - Region closest to your users
```

### 2. Initial Server Setup

SSH into your server:

```bash
ssh root@your_droplet_ip
```

Update system and install Docker:

```bash
# Update packages
apt update && apt upgrade -y

# Install dependencies
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
systemctl enable docker
systemctl start docker

# Verify installation
docker --version
docker compose version
```

### 3. Create Non-Root User

```bash
# Create user
adduser deploy

# Add to docker group
usermod -aG docker deploy

# Add to sudo group
usermod -aG sudo deploy

# Copy SSH keys
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

### 4. Secure the Server

```bash
# Switch to deploy user
su - deploy

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root SSH login (edit /etc/ssh/sshd_config)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

---

## Domain & SSL Setup

### 1. Configure DNS

Add these DNS records to your domain:

| Type | Name | Value |
|------|------|-------|
| A | @ | your_droplet_ip |
| A | api | your_droplet_ip |
| A | storage | your_droplet_ip |
| A | minio | your_droplet_ip |

### 2. Get SSL Certificates

Before starting containers, get initial certificates:

```bash
# Create directories
mkdir -p docker/nginx/conf.d

# Run certbot standalone (before nginx starts)
docker run -it --rm \
  -v $(pwd)/certbot_data:/var/www/certbot \
  -v $(pwd)/ssl_certs:/etc/letsencrypt \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  -d farrel-space.online \
  -d api.farrel-space.online \
  -d storage.farrel-space.online \
  -d minio.farrel-space.online \
  --email your@email.com \
  --agree-tos \
  --no-eff-email
```

---

## MinIO Configuration

### Making Files Publicly Accessible

After MinIO starts, configure the bucket policy:

```bash
# Install mc (MinIO Client)
docker exec -it presentation-minio mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY

# Create bucket if not exists
docker exec -it presentation-minio mc mb local/presentation-builder --ignore-existing

# Set bucket policy to public read
docker exec -it presentation-minio mc anonymous set download local/presentation-builder
```

Or create a bucket policy file `docker/minio/policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::presentation-builder/*"]
    }
  ]
}
```

Apply the policy:

```bash
docker exec -it presentation-minio mc anonymous set-json /path/to/policy.json local/presentation-builder
```

### Update MinIO Service to Return Public URLs

Update your MinIO service to construct public URLs:

```typescript
// In minio.service.ts - update getPublicUrl method
getPublicUrl(objectName: string): string {
  const publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');
  const bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
  return `${publicUrl}/${bucketName}/${objectName}`;
}
```

---

## Deployment Steps

### 1. Clone Repository on Server

```bash
# SSH as deploy user
ssh deploy@your_droplet_ip

# Clone repository
git clone https://github.com/your-username/presentation-builder-app.git
cd presentation-builder-app
```

### 2. Configure Environment

```bash
# Copy and edit environment file
cp docker/.env.production .env
nano .env

# Update with your actual values
```

### 3. Build and Start Services

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Run Database Migrations

```bash
# Run Prisma migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 5. Configure MinIO Bucket

```bash
# Set up public access for the bucket
docker exec -it presentation-minio mc alias set local http://localhost:9000 YOUR_ACCESS_KEY YOUR_SECRET_KEY
docker exec -it presentation-minio mc mb local/presentation-builder --ignore-existing
docker exec -it presentation-minio mc anonymous set download local/presentation-builder
```

---

## Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Database Backup

```bash
# Create backup
docker exec presentation-db pg_dump -U presentation_user presentation_builder > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i presentation-db psql -U presentation_user presentation_builder < backup_file.sql
```

### MinIO Backup

```bash
# Backup MinIO data
docker run --rm \
  -v presentation-builder-app_minio_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar cvf /backup/minio_backup_$(date +%Y%m%d).tar /data
```

### SSL Certificate Renewal

Certbot auto-renews certificates. To manually renew:

```bash
docker compose -f docker-compose.prod.yml exec certbot certbot renew
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Monitoring

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats

# Check disk space
df -h
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs service_name

# Rebuild container
docker compose -f docker-compose.prod.yml up -d --build service_name
```

### Database connection issues

```bash
# Check if postgres is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Check connection from backend
docker compose -f docker-compose.prod.yml exec backend nc -zv postgres 5432
```

### MinIO access issues

```bash
# Check MinIO health
docker compose -f docker-compose.prod.yml exec minio mc admin info local

# Test bucket access
curl -I https://storage.farrel-space.online/presentation-builder/test.png
```

### Nginx 502 Bad Gateway

```bash
# Check if upstream services are running
docker compose -f docker-compose.prod.yml ps

# Check nginx logs
docker compose -f docker-compose.prod.yml logs nginx
```

---

## URLs Summary

After deployment, your services will be available at:

| Service | URL |
|---------|-----|
| Frontend | https://farrel-space.online |
| Backend API | https://api.farrel-space.online/api/v1 |
| MinIO Files | https://storage.farrel-space.online/presentation-builder/{path} |
| MinIO Console | https://minio.farrel-space.online |

---

## Security Checklist

- [ ] Change default database password
- [ ] Change MinIO credentials
- [ ] Enable firewall (ufw)
- [ ] Disable root SSH login
- [ ] Set up fail2ban
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Enable automatic security updates
- [ ] Set up monitoring (optional: Datadog, New Relic, etc.)
- [ ] Set up log aggregation (optional: Loki, ELK, etc.)
