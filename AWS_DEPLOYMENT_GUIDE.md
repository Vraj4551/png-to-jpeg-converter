# Complete AWS Deployment Guide
## PNG to JPEG Converter with Authentication

This guide will help you deploy your full-stack PNG to JPEG converter with user authentication to AWS using EC2, RDS, and Apache.

## 🏗️ Architecture Overview

```
Internet → EC2 (Apache + PHP) → RDS (MySQL) → Users
    ↓
GitHub Repository (Code Storage)
```

## 📋 Prerequisites

- AWS Account with appropriate permissions
- GitHub repository with your code
- Basic knowledge of AWS services
- SSH client for EC2 access

## 🚀 Step 1: Create EC2 Instance

### 1.1 Launch EC2 Instance

1. **Go to EC2 Console**
   - Navigate to: https://console.aws.amazon.com/ec2/
   - Click "Launch Instance"

2. **Choose AMI**
   - Select "Amazon Linux 2 AMI" (free tier eligible)
   - Architecture: 64-bit (x86)

3. **Choose Instance Type**
   - Select "t2.micro" (free tier eligible)
   - For production, consider t3.small or larger

4. **Configure Security Group**
   ```
   Name: png-converter-web-sg
   Description: Security group for PNG converter web server
   
   Inbound Rules:
   - Type: SSH, Port: 22, Source: Your IP
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0 (optional)
   ```

5. **Launch Instance**
   - Create or select existing key pair
   - Download .pem file securely

### 1.2 Connect to EC2

```bash
# Replace with your key file and EC2 IP
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

## 🗄️ Step 2: Set Up RDS Database

### 2.1 Create RDS Instance

1. **Go to RDS Console**
   - Navigate to: https://console.aws.amazon.com/rds/
   - Click "Create database"

2. **Database Configuration**
   ```
   Engine: MySQL 8.0
   Template: Free tier (or Production)
   DB instance identifier: png-converter-db
   Master username: admin
   Master password: [Create strong password]
   ```

3. **Instance Configuration**
   ```
   DB instance class: db.t3.micro (free tier)
   Storage: 20 GB General Purpose SSD
   ```

4. **Connectivity**
   ```
   VPC: Default VPC
   Subnet group: default
   Public access: Yes
   VPC security groups: Create new (png-converter-db-sg)
   Port: 3306
   ```

5. **Additional Configuration**
   ```
   Initial database name: png_converter_db
   Backup retention: 7 days
   Enable encryption: Yes
   ```

### 2.2 Configure Security Groups

**For RDS Security Group (png-converter-db-sg):**
```
Type: MySQL/Aurora
Port: 3306
Source: png-converter-web-sg (EC2 security group)
```

## 🔧 Step 3: Set Up EC2 Server

### 3.1 Run Setup Script

```bash
# On your EC2 instance
sudo yum update -y

# Download and run setup script
curl -O https://raw.githubusercontent.com/Vraj4551/png-to-jpeg-converter/main/deployment/ec2-setup.sh
chmod +x ec2-setup.sh
sudo ./ec2-setup.sh
```

### 3.2 Deploy Your Application

```bash
# Clone your repository
sudo git clone https://github.com/Vraj4551/png-to-jpeg-converter.git /var/www/html/png-converter

# Set proper permissions
sudo chown -R apache:apache /var/www/html/png-converter
sudo chmod -R 755 /var/www/html/png-converter
```

### 3.3 Configure Database Connection

```bash
# Edit database configuration
sudo nano /var/www/html/png-converter/backend/config/database.php
```

Update the connection details:
```php
private $host = "your-rds-endpoint.region.rds.amazonaws.com";
private $db_name = "png_converter_db";
private $username = "admin";
private $password = "your_rds_password";
```

## 🗃️ Step 4: Set Up Database

### 4.1 Run Database Schema

```bash
# Connect to RDS from EC2
mysql -h your-rds-endpoint.region.rds.amazonaws.com -u admin -p png_converter_db

# Run schema commands
source /var/www/html/png-converter/database/schema.sql
exit
```

### 4.2 Test Database Connection

```bash
# Create test script
sudo tee /var/www/html/png-converter/test-db.php > /dev/null <<'EOF'
<?php
require_once 'backend/config/database.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    echo "Database connection successful!";
} catch(Exception $e) {
    echo "Database connection failed: " . $e->getMessage();
}
?>
EOF

# Test connection
curl http://localhost/test-db.php
```

## 🔐 Step 5: Configure SSL (Optional but Recommended)

### 5.1 Install Certbot

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d your-domain.com
```

### 5.2 Auto-renewal

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 🚀 Step 6: Deploy and Test

### 6.1 Final Deployment

```bash
# Run deployment script
cd /var/www/html/png-converter
sudo ./deployment/deploy.sh
```

### 6.2 Test Your Application

1. **Visit your EC2 public IP**
   - `http://your-ec2-public-ip`

2. **Test Features**
   - User registration
   - User login
   - PNG to JPEG conversion
   - File download

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Set Up CloudWatch Monitoring

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### 7.2 Create Alarms

- CPU utilization > 80%
- Memory usage > 80%
- Disk space < 20%
- RDS connections > 80% of max

## 💰 Cost Optimization

### Free Tier Limits:
- EC2: 750 hours/month of t2.micro
- RDS: 750 hours/month of db.t2.micro
- 30 GB of EBS storage
- 20 GB of RDS storage

### Estimated Monthly Cost (Beyond Free Tier):
- EC2 t3.small: ~$15/month
- RDS db.t3.micro: ~$12/month
- **Total: ~$27/month**

## 🔧 Troubleshooting

### Common Issues:

1. **502 Bad Gateway**
   ```bash
   sudo systemctl status httpd
   sudo tail -f /var/log/httpd/error_log
   ```

2. **Database Connection Failed**
   - Check RDS security groups
   - Verify database credentials
   - Test connection manually

3. **Permission Denied**
   ```bash
   sudo chown -R apache:apache /var/www/html/png-converter
   sudo chmod -R 755 /var/www/html/png-converter
   ```

### Useful Commands:

```bash
# Check Apache status
sudo systemctl status httpd

# View Apache logs
sudo tail -f /var/log/httpd/error_log
sudo tail -f /var/log/httpd/access_log

# Check PHP configuration
php -v
php -m | grep mysql

# Test database connection
mysql -h your-rds-endpoint -u admin -p
```

## 🔄 Step 8: Automated Deployments

### 8.1 Set Up GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/html/png-converter
            sudo git pull origin main
            sudo systemctl restart httpd
```

## ✅ Final Checklist

- [ ] EC2 instance running with Apache
- [ ] RDS database created and accessible
- [ ] Application deployed and accessible
- [ ] User registration/login working
- [ ] PNG to JPEG conversion working
- [ ] Security groups configured properly
- [ ] SSL certificate installed (optional)
- [ ] Monitoring set up
- [ ] Backups configured

## 🎉 Congratulations!

Your PNG to JPEG converter with authentication is now live on AWS!

**Access URLs:**
- Application: `http://your-ec2-public-ip`
- With domain: `https://your-domain.com`

**Admin Credentials:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123` (change this immediately!)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review AWS CloudWatch logs
3. Check application logs in `/var/log/httpd/`
4. Verify security group configurations

Happy converting! 🚀

