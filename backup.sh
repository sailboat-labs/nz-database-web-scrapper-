#!/bin/bash

# Set the paths to the data files
DATA_FILE="./data.json"
BACKUP_DIR="./backup"

# Get the current timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Set the path to the backup file
BACKUP_FILE_PATH="$BACKUP_DIR/backup-$TIMESTAMP.json"

# Check if the data file exists
if [ -f "$DATA_FILE_PATH" ]; then
    # If it exists, copy it to the backup file
    cp $DATA_FILE "$BACKUP_FILE_PATH"
fi
