# AWS RDS Setup Guide

## Step 1: Create RDS MySQL Instance

### Using AWS Console:

1. **Go to RDS Console**
   - Navigate to: https://console.aws.amazon.com/rds/
   - Click "Create database"

2. **Choose Database Engine**
   - Select "MySQL"
   - Choose "MySQL 8.0" or "MySQL 5.7"

3. **Choose Template**
   - For production: "Production"
   - For testing: "Free tier" (eligible for new AWS accounts)

4. **Configure Database Settings**
   ```
   DB instance identifier: png-converter-db
   Master username: admin
   Master password: [Create strong password]
   ```

5. **Choose Instance Configuration**
   ```
   DB instance class: db.t3.micro (Free tier) or db.t3.small
   Storage type: General Purpose SSD (gp2)
   Allocated storage: 20 GB (minimum)
   ```

6. **Configure Connectivity**
   ```
   Virtual Private Cloud (VPC): Default VPC
   Subnet group: default
   Public access: Yes (for EC2 connection)
   VPC security groups: Create new
   Database port: 3306
   ```

7. **Configure Security Group**
   - Create new security group: `png-converter-db-sg`
   - Add inbound rule:
     ```
     Type: MySQL/Aurora
     Port: 3306
     Source: EC2 security group or your IP
     ```

8. **Configure Additional Settings**
   ```
   Initial database name: png_converter_db
   Backup retention: 7 days
   Enable encryption: Yes
   ```

9. **Click "Create database"**

## Step 2: Configure Database Connection

### Update Database Configuration:

1. **Get RDS Endpoint**
   - Go to RDS console
   - Click on your database instance
   - Copy the "Endpoint" (e.g., `png-converter-db.abc123.us-east-1.rds.amazonaws.com`)

2. **Update backend/config/database.php**
   ```php
   private $host = "your-rds-endpoint.region.rds.amazonaws.com";
   private $db_name = "png_converter_db";
   private $username = "admin";
   private $password = "your_password";
   ```

## Step 3: Set Up Database Schema

### Option A: Using MySQL Workbench or phpMyAdmin

1. Connect to your RDS instance
2. Run the SQL commands from `database/schema.sql`

### Option B: Using Command Line

1. **Connect to RDS from EC2**
   ```bash
   mysql -h your-rds-endpoint.region.rds.amazonaws.com -u admin -p
   ```

2. **Run Schema Setup**
   ```bash
   source /var/www/html/png-converter/database/schema.sql
   ```

### Option C: Using PHP Script

1. **Upload setup script to EC2**
   ```bash
   sudo cp /var/www/html/png-converter/database/setup.php /var/www/html/png-converter/
   ```

2. **Run setup script**
   - Visit: `http://your-ec2-ip/setup.php`
   - Delete the file after setup

## Step 4: Test Database Connection

### Create Test Script:

```php
<?php
// test-db.php
require_once 'backend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    echo "Database connection successful!";
} catch(Exception $e) {
    echo "Database connection failed: " . $e->getMessage();
}
?>
```

## Step 5: Security Best Practices

### 1. Database Security:
- Use strong passwords
- Enable encryption at rest
- Regular backups
- Monitor access logs

### 2. Network Security:
- Use private subnets for RDS (recommended for production)
- Configure security groups properly
- Use SSL/TLS connections

### 3. Application Security:
- Use prepared statements (already implemented)
- Validate all inputs
- Hash passwords (already implemented)
- Regular security updates

## Step 6: Monitoring and Maintenance

### CloudWatch Monitoring:
- Enable detailed monitoring
- Set up alarms for:
  - CPU utilization
  - Database connections
  - Free storage space
  - Read/Write IOPS

### Backup Strategy:
- Automated backups (7-35 days)
- Manual snapshots before major changes
- Point-in-time recovery

## Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Check security groups
   - Verify RDS is publicly accessible
   - Check VPC configuration

2. **Authentication Failed**
   - Verify username/password
   - Check master user permissions

3. **Database Not Found**
   - Ensure initial database name is correct
   - Run schema setup script

### Useful Commands:

```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier png-converter-db

# Test connection from EC2
telnet your-rds-endpoint 3306

# View RDS logs
aws rds describe-db-log-files --db-instance-identifier png-converter-db
```

## Cost Optimization

### Free Tier Limits:
- 750 hours of db.t2.micro instance
- 20 GB of General Purpose SSD storage
- 20 GB of backup storage

### Production Recommendations:
- Use Reserved Instances for predictable workloads
- Monitor and optimize storage usage
- Regular cleanup of old backups
- Use read replicas for read-heavy workloads

