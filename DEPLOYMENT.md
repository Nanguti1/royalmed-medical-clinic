# Royalmed Medical Clinic - Production Deployment Guide

## Server Requirements

### Hardware
- CPU: 2 cores minimum (4 cores recommended)
- RAM: 4GB minimum (8GB recommended)
- Storage: 50GB minimum SSD
- Network: Stable internet connection

### Software
- **PHP**: 8.3 or higher
- **MySQL**: 8.0 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Composer**: 2.x or higher
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **PHP Extensions**: 
  - openssl
  - pdo
  - pdo_mysql
  - mbstring
  - tokenizer
  - xml
  - ctype
  - json
  - bcmath
  - zip

## Deployment Procedure

### 1. Server Setup

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-zip php8.3-curl php8.3-json -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y
```

#### Windows Server
- Install PHP 8.3+ from https://windows.php.net/download/
- Install MySQL 8.0+ from https://dev.mysql.com/downloads/mysql/
- Install Node.js from https://nodejs.org/
- Install Composer from https://getcomposer.org/
- Install IIS or Apache

### 2. Application Setup

```bash
# Clone repository
git clone <repository-url> /var/www/royalmed
cd /var/www/royalmed

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies
npm ci

# Build frontend assets
npm run build

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure environment variables
nano .env
```

### 3. Environment Configuration

Critical `.env` settings for production:

```env
APP_NAME=Royalmed Medical Clinic
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generated-key>
APP_URL=https://clinic.royalmed.co.ke

LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=royalmed
DB_USERNAME=royalmed_user
DB_PASSWORD=<strong-password>

SESSION_DRIVER=database
SESSION_LIFETIME=480
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
```

### 4. Database Setup

```bash
# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE royalmed CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'royalmed_user'@'localhost' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON royalmed.* TO 'royalmed_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Run migrations
php artisan migrate --force

# Seed initial data
php artisan db:seed --force
```

### 5. Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/royalmed

# Set permissions
sudo chmod -R 755 /var/www/royalmed
sudo chmod -R 775 /var/www/royalmed/storage
sudo chmod -R 775 /var/www/royalmed/bootstrap/cache
```

### 6. Cache Optimization

```bash
# Clear configuration cache
php artisan config:clear

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### 7. Web Server Configuration

#### Nginx
```nginx
server {
    listen 80;
    server_name clinic.royalmed.co.ke;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clinic.royalmed.co.ke;

    root /var/www/royalmed/public;
    index index.php;

    ssl_certificate /etc/ssl/certs/royalmed.crt;
    ssl_certificate_key /etc/ssl/private/royalmed.key;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### Apache
```apache
<VirtualHost *:443>
    ServerName clinic.royalmed.co.ke
    DocumentRoot /var/www/royalmed/public

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/royalmed.crt
    SSLCertificateKeyFile /etc/ssl/private/royalmed.key

    <Directory /var/www/royalmed/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 8. Queue Worker Setup

```bash
# Install Supervisor (Ubuntu/Debian)
sudo apt install supervisor -y

# Create supervisor config
sudo nano /etc/supervisor/conf.d/royalmed-worker.conf
```

```ini
[program:royalmed-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/royalmed/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/royalmed/storage/logs/worker.log
```

```bash
# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start royalmed-worker:*
```

### 9. Scheduler Setup

```bash
# Add to crontab
crontab -e
```

```cron
* * * * * cd /var/www/royalmed && php artisan schedule:run >> /dev/null 2>&1
```

### 10. Backup Setup

#### Linux
```bash
# Make backup script executable
chmod +x backup.sh

# Add to crontab for daily backup at 2 AM
0 2 * * * /var/www/royalmed/backup.sh
```

#### Windows
```powershell
# Schedule daily backup at 2 AM
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\inetpub\royalmed\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "Royalmed Backup" -User "SYSTEM"
```

### 11. HTTPS Setup

#### Let's Encrypt (Ubuntu/Debian)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d clinic.royalmed.co.ke
```

### 12. Health Verification

```bash
# Test application
curl https://clinic.royalmed.co.ke/health

# Check logs
tail -f storage/logs/laravel.log

# Verify queue worker
sudo supervisorctl status royalmed-worker:*
```

## Rollback Procedure

If deployment fails:

```bash
# Restore previous code
git checkout <previous-commit>

# Restore database backup
gunzip < /var/backups/royalmed/royalmed_YYYYMMDD_HHMMSS.sql.gz | mysql -u royalmed_user -p royalmed

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild frontend
npm run build

# Restart services
sudo systemctl restart nginx
sudo systemctl restart php8.3-fpm
sudo supervisorctl restart royalmed-worker:*
```

## Troubleshooting

### 500 Internal Server Error
- Check storage/logs/laravel.log
- Verify permissions: `ls -la storage/`
- Check PHP-FPM is running: `sudo systemctl status php8.3-fpm`

### Database Connection Failed
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in .env
- Test connection: `mysql -u royalmed_user -p royalmed`

### Queue Jobs Not Processing
- Check supervisor status: `sudo supervisorctl status`
- Check worker logs: `tail -f storage/logs/worker.log`
- Restart worker: `sudo supervisorctl restart royalmed-worker:*`

### Frontend Not Loading
- Rebuild assets: `npm run build`
- Check public/build directory exists
- Verify Vite configuration
