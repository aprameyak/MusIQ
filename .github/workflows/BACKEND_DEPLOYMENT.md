# Backend CI/CD Deployment Guide

This document explains how to configure and use the GitHub Actions CI/CD pipeline for the MusIQ backend.

## Overview

The CI/CD pipeline consists of two main jobs:

1. **CI Job**: Runs on every push and PR to validate code quality
   - Lints the codebase
   - Builds the TypeScript project
   - Verifies build output

2. **Deploy Job**: Runs only on pushes to `main` branch
   - Builds the project
   - Creates a deployment package
   - Deploys to your server via SSH
   - Runs database migrations
   - Restarts the application using PM2

## Prerequisites

### Server Requirements

- Ubuntu 22.04 LTS (or similar Linux distribution)
- Node.js 20.x installed
- PM2 installed globally: `sudo npm install -g pm2`
- SSH access configured
- User with sudo privileges

### Server Setup Steps

1. **Create deployment directory:**
   ```bash
   sudo mkdir -p /opt/musiq-backend
   sudo chown $USER:$USER /opt/musiq-backend
   ```

2. **Install Node.js 20.x:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 globally:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Setup PM2 startup script:**
   ```bash
   pm2 startup systemd
   # Follow the instructions provided
   ```

5. **Create environment file:**
   ```bash
   sudo mkdir -p /opt/musiq-backend
   sudo nano /opt/musiq-backend/.env
   ```
   
   Add your environment variables (DATABASE_URL, JWT_SECRET, etc.)

6. **Create initial PM2 ecosystem file (optional):**
   ```bash
   sudo nano /opt/musiq-backend/ecosystem.config.js
   ```
   
   ```javascript
   module.exports = {
     apps: [{
       name: 'musiq-api',
       script: './dist/index.js',
       cwd: '/opt/musiq-backend',
       instances: 2,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: '/var/log/musiq-api/error.log',
       out_file: '/var/log/musiq-api/out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
       autorestart: true,
       max_memory_restart: '500M'
     }]
   };
   ```

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

1. Go to: **Settings** → **Secrets and variables** → **Actions**

2. Add these secrets:

   - `SSH_PRIVATE_KEY`: Your private SSH key for server access
     ```bash
     # Generate if needed:
     ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
     # Copy the private key content:
     cat ~/.ssh/github_actions
     ```

   - `SERVER_HOST`: Your server's IP address or domain
     ```
     Example: 192.168.1.100 or api.musiq.app
     ```

   - `SERVER_USER`: SSH username for deployment
     ```
     Example: ubuntu or deploy
     ```

### Setting up SSH Key Authentication

1. **Generate SSH key pair (if needed):**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   ```

2. **Copy public key to server:**
   ```bash
   ssh-copy-id -i ~/.ssh/github_actions.pub $SERVER_USER@$SERVER_HOST
   ```

3. **Add private key to GitHub Secrets:**
   - Copy the private key: `cat ~/.ssh/github_actions`
   - Paste into GitHub Secrets as `SSH_PRIVATE_KEY`

4. **Test SSH connection:**
   ```bash
   ssh -i ~/.ssh/github_actions $SERVER_USER@$SERVER_HOST
   ```

## Deployment Process

### Automatic Deployment

1. Push to `main` branch
2. CI job runs automatically
3. If CI passes, deploy job runs
4. Application is deployed and restarted

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Backend CI/CD** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Deployment Details

### What Gets Deployed

- Compiled JavaScript files (`dist/`)
- `package.json` and `package-lock.json`
- Database migrations
- Database seeds (if any)

### Deployment Steps

1. **Backup**: Current deployment is backed up with timestamp
2. **Extract**: Deployment package is extracted to `/opt/musiq-backend`
3. **Install**: Production dependencies are installed
4. **Migrate**: Database migrations are run
5. **Restart**: Application is restarted via PM2

### Rollback

If deployment fails, you can manually rollback:

```bash
# SSH into server
ssh $SERVER_USER@$SERVER_HOST

# List backups
ls -la /opt/ | grep musiq-backend-backup

# Restore from backup
sudo rm -rf /opt/musiq-backend
sudo cp -r /opt/musiq-backend-backup-YYYYMMDD-HHMMSS /opt/musiq-backend
cd /opt/musiq-backend
sudo npm ci --production
sudo pm2 restart musiq-api
```

## Monitoring

### Check Application Status

```bash
ssh $SERVER_USER@$SERVER_HOST
sudo pm2 status musiq-api
sudo pm2 logs musiq-api
```

### View Logs

```bash
# PM2 logs
sudo pm2 logs musiq-api

# Application logs (if configured)
sudo tail -f /var/log/musiq-api/out.log
sudo tail -f /var/log/musiq-api/error.log
```

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs for specific error
2. Verify SSH connection works manually
3. Ensure server has required dependencies
4. Check disk space: `df -h`
5. Verify permissions on `/opt/musiq-backend`

### Application Won't Start

1. Check PM2 status: `sudo pm2 status`
2. View logs: `sudo pm2 logs musiq-api`
3. Check environment variables: `sudo cat /opt/musiq-backend/.env`
4. Verify database connection
5. Check port availability: `sudo netstat -tulpn | grep 3000`

### Database Migration Issues

1. Check migration status manually:
   ```bash
   cd /opt/musiq-backend
   sudo npm run migrate
   ```

2. Review migration files for errors

3. Check database connection string in `.env`

## Security Considerations

1. **SSH Keys**: Use dedicated deployment keys, not personal SSH keys
2. **Secrets**: Never commit secrets to repository
3. **Permissions**: Use least privilege principle for deployment user
4. **Firewall**: Configure firewall to allow only necessary ports
5. **SSL/TLS**: Use HTTPS in production (configure Nginx reverse proxy)

## Next Steps

1. Configure Nginx as reverse proxy
2. Setup SSL certificates (Let's Encrypt)
3. Configure firewall rules
4. Setup monitoring and alerting
5. Configure log rotation
6. Setup database backups

