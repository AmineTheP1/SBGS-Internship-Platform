#!/bin/bash

# Database restore script for SBGS
# Usage: ./restore.sh backup_file.sql

if [ $# -eq 0 ]; then
    echo "Usage: $0 backup_file.sql"
    echo "Available backups:"
    ls -la ./database/backups/*.sql 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
CONTAINER_NAME="sbgs-postgres"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"
echo "This will overwrite the current database. Are you sure? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Restoring database..."
    
    # Drop and recreate database
    docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS sbgs_db;"
    docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "CREATE DATABASE sbgs_db;"
    
    # Restore from backup
    docker exec -i $CONTAINER_NAME psql -U postgres -d sbgs_db < "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Database restored successfully!"
    else
        echo "Restore failed!"
        exit 1
    fi
else
    echo "Restore cancelled."
fi 