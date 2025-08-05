# SBGS Database Setup

This directory contains the database configuration and management scripts for the SBGS platform.

## Database Configuration

The PostgreSQL database is configured with the following settings:
- **Database Name**: `sbgs_db`
- **Username**: `postgres`
- **Password**: `postgres`
- **Internal Port**: `5432` (inside container)
- **External Port**: `5433` (accessible from host)

## Data Persistence

The database data is stored in a Docker volume named `postgres_data` to ensure data persistence across container restarts and updates.

## Initialization

When the PostgreSQL container starts for the first time, it will automatically:
1. Create the database and user
2. Run the initialization script (`init/01-init.sql`)
3. Restore your existing database backup
4. Set up all tables, data, and permissions

## Backup and Restore

### Creating Backups

**Linux/Mac:**
```bash
./database/backup.sh [optional_backup_name]
```

**Windows:**
```cmd
database\backup.bat [optional_backup_name]
```

### Restoring Backups

**Linux/Mac:**
```bash
./database/restore.sh backup_file.sql
```

## Database Connection

From your application, use the following connection string:
```
postgresql://postgres:postgres@postgres:5432/sbgs_db
```

**Note**: The backend uses `postgres:5432` (internal container network), not the external port.

## Manual Database Access

To access the database directly:

```bash
# Connect to the database container
docker exec -it sbgs-postgres psql -U postgres -d sbgs_db

# Or connect from host (using external port)
docker exec -it sbgs-postgres psql -U postgres -d sbgs_db -h localhost -p 5433
```

## Database Schema

The database includes your existing tables and data from your backup file.

## Troubleshooting

### Database not starting
1. Check if port 5433 is available (changed from 5432 to avoid conflicts)
2. Ensure Docker has enough resources
3. Check the container logs: `docker logs sbgs-postgres`

### Data loss prevention
- Always use the provided backup scripts before major updates
- The `postgres_data` volume ensures data persistence
- Never delete the volume unless you want to lose all data

### Performance optimization
- The database includes indexes from your original backup
- Consider adding more indexes based on your query patterns 