#!/bin/bash

# Royalmed Medical Clinic - Database Backup Script
# This script creates automated backups of the MySQL database
# Run this script via cron daily for production backups

set -e

# Configuration
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-royalmed}"
DB_USER="${DB_USER:-royalmed_user}"
DB_PASSWORD="${DB_PASSWORD}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/royalmed}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/royalmed_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "${LOG_FILE}"
}

log "Starting database backup"

# Perform backup
if mysqldump -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"; then

    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"

    # Remove old backups
    find "${BACKUP_DIR}" -name "royalmed_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    log "Removed backups older than ${RETENTION_DAYS} days"

    # Verify backup file exists and is not empty
    if [ -s "${BACKUP_FILE}" ]; then
        log "Backup verification passed"
        exit 0
    else
        log "ERROR: Backup file is empty"
        exit 1
    fi
else
    log "ERROR: Backup failed"
    exit 1
fi
