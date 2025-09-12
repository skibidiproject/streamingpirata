#!/bin/bash
set -e

echo "=== Creating databases ==="

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE umami_db;
    CREATE DATABASE streaming_db;
EOSQL

echo "=== Databases created successfully ==="