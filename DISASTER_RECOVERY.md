# Royalmed Medical Clinic - Disaster Recovery Procedure

## Overview

This document outlines the disaster recovery procedures for the Royalmed Medical Clinic Management System.

## Recovery Objectives

- **RPO (Recovery Point Objective)**: 24 hours (last daily backup)
- **RTO (Recovery Time Objective)**: 4 hours (from backup restoration to operational)

## Disaster Scenarios

### Scenario 1: Clinic Computer/Server Failure

**Immediate Actions:**
1. Identify the failure point (hardware, OS, or application)
2. Assess data center/backup availability
3. Notify stakeholders (clinic management, IT support)

**Recovery Steps:**

1. **Hardware Replacement**
   - Acquire replacement server with similar specifications
   - Install required software (PHP, MySQL, Node.js, etc.)
   - Configure network settings

2. **Application Restoration**
   ```bash
   # Clone repository
   git clone <repository-url> /var/www/royalmed
   cd /var/www/royalmed

   # Install dependencies
   composer install --no-dev --optimize-autoloader
   npm ci
   npm run build

   # Configure environment
   cp .env.example .env
   php artisan key:generate
   # Configure .env with production values
   ```

3. **Database Restoration**
   ```bash
   # Restore from latest backup
   gunzip < /var/backups/royalmed/royalmed_YYYYMMDD_HHMMSS.sql.gz | mysql -u royalmed_user -p royalmed

   # Verify restoration
   mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM patients;"
   mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM payments;"
   ```

4. **Service Restart**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl restart php8.3-fpm
   sudo supervisorctl restart royalmed-worker:*
   ```

5. **Verification**
   - Access application via browser
   - Test login functionality
   - Verify patient data is accessible
   - Check recent payments and invoices

**Estimated Time**: 2-4 hours

### Scenario 2: MySQL Database Corruption

**Immediate Actions:**
1. Stop MySQL service to prevent further damage
2. Backup corrupted data files before attempting repair
3. Assess extent of corruption

**Recovery Steps:**

1. **MySQL Repair Attempt**
   ```bash
   sudo systemctl stop mysql
   cd /var/lib/mysql
   sudo myisamchk -r royalmed/*.MYI
   sudo systemctl start mysql
   ```

2. **If Repair Fails - Restore from Backup**
   ```bash
   # Stop MySQL
   sudo systemctl stop mysql

   # Backup corrupted data directory
   sudo mv /var/lib/mysql /var/lib/mysql.corrupted

   # Initialize new MySQL installation
   sudo mysql_install_db

   # Start MySQL
   sudo systemctl start mysql

   # Restore database
   gunzip < /var/backups/royalmed/royalmed_YYYYMMDD_HHMMSS.sql.gz | mysql -u royalmed_user -p royalmed
   ```

3. **Binary Log Recovery (if available)**
   ```bash
   # If binary logs are enabled, replay transactions since last backup
   mysqlbinlog /var/lib/mysql/mysql-bin.000123 | mysql -u royalmed_user -p royalmed
   ```

4. **Verification**
   ```bash
   # Check table integrity
   mysql -u royalmed_user -p royalmed -e "CHECK TABLE patients, visits, payments EXTENDED;"

   # Verify data counts
   mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM patients;"
   mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM payments;"
   ```

**Estimated Time**: 1-2 hours

### Scenario 3: File System Corruption

**Immediate Actions:**
1. Stop application services
2. Identify corrupted directories
3. Restore from backups

**Recovery Steps:**

1. **Restore Application Files**
   ```bash
   # Stop services
   sudo systemctl stop nginx
   sudo systemctl stop php8.3-fpm

   # Backup corrupted directory
   sudo mv /var/www/royalmed /var/www/royalmed.corrupted

   # Restore from git or backup
   git clone <repository-url> /var/www/royalmed
   cd /var/www/royalmed

   # Rebuild
   composer install --no-dev --optimize-autoloader
   npm ci
   npm run build
   ```

2. **Restore Storage Files**
   ```bash
   # If storage was backed up separately
   sudo cp -r /var/backups/royalmed/storage/* /var/www/royalmed/storage/

   # Set permissions
   sudo chown -R www-data:www-data /var/www/royalmed
   sudo chmod -R 755 /var/www/royalmed
   sudo chmod -R 775 /var/www/royalmed/storage
   ```

3. **Restart Services**
   ```bash
   sudo systemctl start nginx
   sudo systemctl start php8.3-fpm
   sudo supervisorctl restart royalmed-worker:*
   ```

**Estimated Time**: 1-2 hours

### Scenario 4: Ransomware/Malware Attack

**Immediate Actions:**
1. Disconnect server from network immediately
2. Do not pay ransom
3. Assess extent of encryption

**Recovery Steps:**

1. **System Wipe**
   - Wipe affected drives
   - Reinstall OS from clean media
   - Update all security patches

2. **Clean Restoration**
   - Restore application from git repository
   - Restore database from offline backup
   - Change all credentials immediately
   - Implement additional security measures

3. **Security Hardening**
   - Enable firewall
   - Disable unnecessary services
   - Implement intrusion detection
   - Review all user accounts

**Estimated Time**: 8-24 hours

## Verification Procedures

### Data Integrity Verification

After any restoration, verify:

```bash
# Patient data
mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM patients;"

# Financial data
mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM invoices;"
mysql -u royalmed_user -p royalmed -e "SELECT COUNT(*) FROM payments;"

# Cross-reference checks
mysql -u royalmed_user -p royalmed -e "SELECT SUM(total_amount) FROM invoices;"
mysql -u royalmed_user -p royalmed -e "SELECT SUM(amount) FROM payments;"
```

### Application Functionality Verification

1. **Authentication**
   - Test login for admin user
   - Test password reset functionality
   - Verify 2FA if enabled

2. **Core Workflows**
   - Create a test patient
   - Register a test visit
   - Create a test invoice
   - Record a test payment
   - Verify data persists

3. **Reporting**
   - Generate reconciliation report
   - Verify totals match database

## Backup Verification

Regular backup verification should be performed weekly:

```bash
# Restore backup to test database
mysql -u royalmed_user -p royalmed_test < /var/backups/royalmed/royalmed_YYYYMMDD_HHMMSS.sql

# Verify counts
mysql -u royalmed_user -p royalmed_test -e "SELECT COUNT(*) FROM patients;"
mysql -u royalmed_user -p royalmed_test -e "SELECT COUNT(*) FROM payments;"

# Drop test database
mysql -u royalmed_user -p -e "DROP DATABASE royalmed_test;"
```

## Communication Plan

**Internal Notification:**
- Clinic Manager: Immediate
- IT Support: Immediate
- Medical Staff: Within 1 hour

**External Notification:**
- Patients: As needed (via clinic notification system)
- Regulatory Bodies: If data breach suspected

## Post-Recovery Actions

1. **Root Cause Analysis**
   - Document what caused the failure
   - Identify preventive measures
   - Update disaster recovery procedures

2. **Testing**
   - Test all restored functionality
   - Perform full reconciliation
   - Verify no data loss

3. **Monitoring**
   - Increase monitoring frequency for 48 hours
   - Review logs for anomalies
   - Monitor system performance

## Emergency Contacts

- **Emergency IT Support**: [Contact Information]
- **Database Administrator**: [Contact Information]
- **Server Provider**: [Contact Information]
- **Clinic Management**: [Contact Information]

## Backup Storage Strategy

**Primary Storage**: Local server at `/var/backups/royalmed`

**Secondary Storage**: External/off-site storage (USB drive, cloud storage, or remote server)

**Backup Rotation**:
- Daily backups retained for 30 days
- Weekly backups retained for 12 weeks
- Monthly backups retained for 12 months

**Backup Encryption**: All backups should be encrypted with GPG if stored off-site
