#!/bin/bash

# Database backup script for SBGS
# Usage: ./backup.sh [backup_name]

BACKUP_NAME=${1:-"sbgs_backup_$(date +%Y%m%d_%H%M%S)"}
BACKUP_DIR="./database/backups"
CONTAINER_NAME="sbgs-postgres"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Creating database backup: $BACKUP_NAME"

# Create backup
docker exec $CONTAINER_NAME pg_dump -U postgres -d sbgs_db > "$BACKUP_DIR/$BACKUP_NAME.sql"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_DIR/$BACKUP_NAME.sql"
    echo "Backup size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.sql" | cut -f1)"
else
    echo "Backup failed!"
    exit 1
fi 