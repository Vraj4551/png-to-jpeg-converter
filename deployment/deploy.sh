#!/bin/bash

# Deployment script for PNG to JPEG Converter
# Run this script to deploy updates to EC2

echo "Starting deployment..."

# Configuration
APP_DIR="/var/www/html/png-converter"
BACKUP_DIR="/var/www/backups/png-converter"
REPO_URL="https://github.com/Vraj4551/png-to-jpeg-converter.git"

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Backup current version
if [ -d "$APP_DIR" ]; then
    echo "Creating backup..."
    sudo cp -r $APP_DIR $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)
fi

# Create app directory if it doesn't exist
sudo mkdir -p $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo "Updating existing repository..."
    cd $APP_DIR
    sudo git pull origin main
else
    echo "Cloning repository..."
    sudo git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Set proper permissions
sudo chown -R apache:apache $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod 644 $APP_DIR/.htaccess

# Set secure permissions for sensitive files
sudo chmod 600 $APP_DIR/backend/config/database.php
sudo chmod 644 $APP_DIR/backend/config/*.php

# Create necessary directories
sudo mkdir -p $APP_DIR/backend/logs
sudo chown apache:apache $APP_DIR/backend/logs
sudo chmod 755 $APP_DIR/backend/logs

# Set up environment file
if [ ! -f "$APP_DIR/.env" ]; then
    sudo tee $APP_DIR/.env > /dev/null <<EOF
# Environment Configuration
APP_ENV=production
APP_DEBUG=false
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_NAME=png_converter_db
DB_USER=your_username
DB_PASS=your_password
EOF
    sudo chmod 600 $APP_DIR/.env
fi

# Install PHP dependencies if composer.json exists
if [ -f "$APP_DIR/composer.json" ]; then
    echo "Installing PHP dependencies..."
    cd $APP_DIR
    sudo composer install --no-dev --optimize-autoloader
fi

# Clear any cached data
sudo rm -rf $APP_DIR/backend/cache/*

# Restart Apache
sudo systemctl restart httpd

# Test the deployment
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ $HTTP_STATUS -eq 200 ]; then
    echo "Deployment successful! HTTP status: $HTTP_STATUS"
else
    echo "Warning: HTTP status is $HTTP_STATUS"
fi

echo "Deployment completed!"
echo "Application URL: http://your-ec2-public-ip"
echo "Check Apache logs: sudo tail -f /var/log/httpd/error_log"

