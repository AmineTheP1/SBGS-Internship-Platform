@echo off
setlocal enabledelayedexpansion

REM Database backup script for SBGS (Windows)
REM Usage: backup.bat [backup_name]

set BACKUP_NAME=%1
if "%BACKUP_NAME%"=="" (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "BACKUP_NAME=sbgs_backup_%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
)

set BACKUP_DIR=.\database\backups
set CONTAINER_NAME=sbgs-postgres

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating database backup: %BACKUP_NAME%

REM Create backup
docker exec %CONTAINER_NAME% pg_dump -U postgres -d sbgs_db > "%BACKUP_DIR%\%BACKUP_NAME%.sql"

if %ERRORLEVEL% EQU 0 (
    echo Backup created successfully: %BACKUP_DIR%\%BACKUP_NAME%.sql
    for %%A in ("%BACKUP_DIR%\%BACKUP_NAME%.sql") do echo Backup size: %%~zA bytes
) else (
    echo Backup failed!
    exit /b 1
)

pause 