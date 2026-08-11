# Royalmed Medical Clinic - Database Backup Script (PowerShell)
# This script creates automated backups of the MySQL database
# Run this script via Windows Task Scheduler daily for production backups

param(
    [string]$DB_HOST = "127.0.0.1",
    [string]$DB_PORT = "3306",
    [string]$DB_NAME = "royalmed",
    [string]$DB_USER = "royalmed_user",
    [string]$DB_PASSWORD = "",
    [string]$BACKUP_DIR = "C:\backups\royalmed",
    [int]$RETENTION_DAYS = 30
)

$ErrorActionPreference = "Stop"

# Create backup directory if it doesn't exist
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = Join-Path $BACKUP_DIR "royalmed_${TIMESTAMP}.sql.gz"
$LOG_FILE = Join-Path $BACKUP_DIR "backup.log"

# Log function
function Log-Message {
    param([string]$Message)
    $LogEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Add-Content -Path $LOG_FILE -Value $LogEntry
    Write-Host $LogEntry
}

Log-Message "Starting database backup"

# Perform backup
$Env:MYSQL_PWD = $DB_PASSWORD
$MysqldumpPath = "mysqldump"

try {
    & $MysqldumpPath `
        -h $DB_HOST `
        -P $DB_PORT `
        -u $DB_USER `
        --single-transaction `
        --quick `
        --lock-tables=false `
        --routines `
        --triggers `
        --events `
        $DB_NAME | gzip > $BACKUP_FILE

    if ($LASTEXITCODE -eq 0) {
        $BACKUP_SIZE = (Get-Item $BACKUP_FILE).Length / 1MB
        Log-Message "Backup completed successfully: $BACKUP_FILE ($([math]::Round($BACKUP_SIZE, 2)) MB)"

        # Remove old backups
        $CutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)
        Get-ChildItem -Path $BACKUP_DIR -Filter "royalmed_*.sql.gz" | Where-Object {
            $_.LastWriteTime -lt $CutoffDate
        } | Remove-Item -Force

        Log-Message "Removed backups older than $RETENTION_DAYS days"

        # Verify backup file exists and is not empty
        if ((Test-Path $BACKUP_FILE) -and ((Get-Item $BACKUP_FILE).Length -gt 0)) {
            Log-Message "Backup verification passed"
            exit 0
        } else {
            Log-Message "ERROR: Backup file is empty"
            exit 1
        }
    } else {
        Log-Message "ERROR: mysqldump failed with exit code $LASTEXITCODE"
        exit 1
    }
} catch {
    Log-Message "ERROR: Backup failed - $_"
    exit 1
} finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}
