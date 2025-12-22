# دليل النشر - QatShop

## المتطلبات

### Server Requirements
- PHP 8.1 أو أحدث
- MySQL 8.0 أو أحدث
- Composer
- Node.js 18+
- 2GB RAM (4GB موصى به)
- 20GB Storage

### Optional
- Redis (للـ caching)
- SSL Certificate (ضروري للإنتاج)

---

## خطوات النشر

### 1. إعداد Server

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت PHP
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip

# تثبيت MySQL
sudo apt install mysql-server

# تثبيت Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. رفع الملفات

```bash
# Clone أو رفع الملفات
git clone your-repo-url /var/www/qatshop
cd /var/www/qatshop
```

### 3. إعداد Backend

```bash
cd backend

# تثبيت Dependencies
composer install --optimize-autoloader --no-dev

# نسخ .env
cp .env.example .env

# تعديل .env
nano .env
```

**ملف .env للإنتاج:**
```env
APP_NAME=QatShop
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=qatshop
DB_USERNAME=your_username
DB_PASSWORD=your_secure_password

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

```bash
# Generate key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 755 storage bootstrap/cache
```

### 4. إعداد Frontend

```bash
cd ..

# تثبيت Dependencies
npm install

# Build للإنتاج
npm run build
```

### 5. إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/qatshop
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/qatshop/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/qatshop /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## النسخ الاحتياطي

### Database Backup

```bash
# إنشاء script للنسخ الاحتياطي
nano /home/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups/database"
mkdir -p $BACKUP_DIR

mysqldump -u username -p'password' qatshop > $BACKUP_DIR/qatshop_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x /home/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/backup-db.sh
```

### Files Backup

```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/qatshop/backend/storage/app/public/
```

---

## Monitoring

### Laravel Logs

```bash
# View logs
tail -f /var/www/qatshop/backend/storage/logs/laravel.log
```

### Nginx Logs

```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### مشكلة: 500 Internal Server Error
```bash
# Check Laravel logs
tail -f backend/storage/logs/laravel.log

# Check permissions
sudo chown -R www-data:www-data storage bootstrap/cache
```

### مشكلة: Database connection failed
```bash
# Check .env file
cat backend/.env | grep DB_

# Test MySQL connection
mysql -u username -p
```

### مشكلة: Images not loading
```bash
# Recreate storage link
php artisan storage:link

# Check permissions
ls -la backend/storage/app/public
```

---

## الصيانة

### تحديث التطبيق

```bash
cd /var/www/qatshop

# Pull latest code
git pull

# Update dependencies
cd backend
composer install --no-dev
php artisan migrate --force
php artisan cache:clear

# Rebuild frontend
cd ..
npm install
npm run build

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

---

**ملاحظة:** تأكد من اختبار جميع الخطوات في بيئة staging قبل النشر للإنتاج!
