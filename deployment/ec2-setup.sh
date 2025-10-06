#!/bin/bash

# EC2 Setup Script for PNG to JPEG Converter
# Run this script on your EC2 instance

echo "Starting EC2 setup for PNG to JPEG Converter..."

# Update system
sudo yum update -y

# Install Apache
sudo yum install -y httpd

# Install PHP and required extensions
sudo yum install -y php php-pdo php-mysqlnd php-json php-mbstring

# Install Git
sudo yum install -y git

# Start and enable Apache
sudo systemctl start httpd
sudo systemctl enable httpd

# Configure Apache
sudo cp /etc/httpd/conf/httpd.conf /etc/httpd/conf/httpd.conf.backup

# Create Apache virtual host configuration
sudo tee /etc/httpd/conf.d/png-converter.conf > /dev/null <<EOF
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/png-converter
    DirectoryIndex index.html index.php
    
    <Directory /var/www/html/png-converter>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog /var/log/httpd/png-converter-error.log
    CustomLog /var/log/httpd/png-converter-access.log combined
</VirtualHost>
EOF

# Create application directory
sudo mkdir -p /var/www/html/png-converter
sudo chown -R apache:apache /var/www/html/png-converter
sudo chmod -R 755 /var/www/html/png-converter

# Configure PHP
sudo tee /etc/php.d/png-converter.ini > /dev/null <<EOF
; PHP Configuration for PNG Converter
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
session.gc_maxlifetime = 3600
date.timezone = UTC
EOF

# Configure Apache to allow .htaccess overrides
sudo sed -i 's/AllowOverride None/AllowOverride All/g' /etc/httpd/conf/httpd.conf

# Create .htaccess file for URL rewriting
sudo tee /var/www/html/png-converter/.htaccess > /dev/null <<EOF
RewriteEngine On

# Handle API requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ backend/api/$1 [L,QSA]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Hide sensitive files
<Files "*.sql">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>
EOF

# Install Composer (PHP dependency manager)
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

# Create log directories
sudo mkdir -p /var/log/httpd/png-converter
sudo chown apache:apache /var/log/httpd/png-converter

# Configure SELinux (if enabled)
if command -v getenforce > /dev/null && getenforce | grep -q "Enforcing"; then
    sudo setsebool -P httpd_can_network_connect 1
    sudo setsebool -P httpd_can_network_connect_db 1
    sudo chcon -R -t httpd_exec_t /var/www/html/png-converter
fi

# Restart Apache
sudo systemctl restart httpd

# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "EC2 setup completed successfully!"
echo "Next steps:"
echo "1. Clone your repository to /var/www/html/png-converter"
echo "2. Configure database connection in backend/config/database.php"
echo "3. Set up RDS database"
echo "4. Run database setup script"

