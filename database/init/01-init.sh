#!/bin/bash
set -e  

until pg_isready -U postgres -h localhost > /dev/null 2>&1; do
  sleep 1
done

psql -U postgres -h localhost -c "CREATE DATABASE eam_database;" 2>/dev/null || true

DUMP_FILE="/home/postgres/init-scripts/dump.sql"
if [ -f "$DUMP_FILE" ]; then
    echo "Загрузка дампа из $DUMP_FILE..."
    psql -U postgres -h localhost -d eam_database -f "$DUMP_FILE"
else
    echo "Файл дампа $DUMP_FILE не найден, пропускаем загрузку."
fi

exit 0