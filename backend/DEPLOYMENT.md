# Deployment Guide

## Azure VM Setup

### 1. Create Azure VM

```bash
# Create resource group
az group create --name music-app-rg --location eastus

# Create VM (Standard B2s: 2 vCPUs, 4GB RAM)
az vm create \
  --resource-group music-app-rg \
  --name music-app-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard
```

### 2. Configure Network Security Group

```bash
# Allow SSH
az network nsg rule create \
  --resource-group music-app-rg \
  --nsg-name music-app-vmNSG \
  --name AllowSSH \
  --priority 1000 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 22 \
  --access Allow \
  --protocol Tcp

# Allow HTTPS
az network nsg rule create \
  --resource-group music-app-rg \
  --nsg-name music-app-vmNSG \
  --name AllowHTTPS \
  --priority 1001 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp

# Deny HTTP (redirect to HTTPS)
az network nsg rule create \
  --resource-group music-app-rg \
  --nsg-name music-app-vmNSG \
  --name AllowHTTP \
  --priority 1002 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 80 \
  --access Allow \
  --protocol Tcp
```

### 3. SSH into VM

```bash
az vm show -d -g music-app-rg -n music-app-vm --query publicIps -o tsv
ssh azureuser@<PUBLIC_IP>
```

### 4. Install Dependencies on VM

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 5. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd MusicApp/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create .env file
nano .env
# Add all environment variables from .env.example

# Run database migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start with PM2
pm2 start dist/index.js --name music-api
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/music-api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
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
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/music-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

## Neon DB Setup

### 1. Create Neon Account

1. Go to https://neon.tech
2. Sign up for an account
3. Create a new project

### 2. Get Connection String

1. In Neon dashboard, go to your project
2. Copy the connection string (includes SSL)
3. Format: `postgresql://user:password@host/database?sslmode=require`

### 3. Update Environment Variables

```bash
# In your .env file
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 4. Run Migrations

```bash
npm run migrate
```

## Environment Variables Checklist

Ensure all these are set in production:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Strong random secret (32+ characters)
- `JWT_REFRESH_SECRET` - Different strong random secret
- `SESSION_SECRET` - Strong random secret
- `ENCRYPTION_KEY` - 32-character encryption key
- `CORS_ORIGIN` - Your iOS app's API endpoint
- OAuth credentials (Apple, Google, Spotify)
- Azure Key Vault credentials (if using)

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs music-api
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Application Logs

```bash
tail -f error.log
tail -f combined.log
```

## Backup Strategy

1. **Database Backups**: Neon DB provides automatic backups
2. **Application Backups**: Use Azure Backup for VM snapshots
3. **Environment Variables**: Store in Azure Key Vault

## Security Checklist

- [ ] All secrets in Azure Key Vault or environment variables
- [ ] SSL/TLS certificates installed and auto-renewing
- [ ] Firewall rules configured (only 443 and 22 open)
- [ ] Database connection uses SSL
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates applied
- [ ] Audit logging enabled
- [ ] MFA enabled for admin accounts

