-- Database setup and connection script for Hospital Appointment Booking System

-- This file contains the setup instructions and connection details

-- Database Configuration
-- Recommended PostgreSQL version: 13 or higher

-- 1. CREATE DATABASE
-- Run this as a superuser (postgres)
CREATE DATABASE healthpal_hospital;

-- 2. CREATE USER AND GRANT PERMISSIONS
-- Create application user
CREATE USER healthpal_app WITH PASSWORD 'your_secure_password_here';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE healthpal_hospital TO healthpal_app;
GRANT USAGE ON SCHEMA public TO healthpal_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO healthpal_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO healthpal_app;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO healthpal_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO healthpal_app;

-- 3. CONNECTION DETAILS FOR YOUR APPLICATION
/*
Database Configuration for your application:

Host: localhost (or your database server)
Port: 5432 (default PostgreSQL port)
Database: healthpal_hospital
Username: healthpal_app
Password: your_secure_password_here

Connection URL format:
postgresql://healthpal_app:your_secure_password_here@localhost:5432/healthpal_hospital

For Node.js/JavaScript applications using pg:
const pool = new Pool({
  user: 'healthpal_app',
  host: 'localhost',
  database: 'healthpal_hospital',
  password: 'your_secure_password_here',
  port: 5432,
});

For environment variables (.env file):
DATABASE_URL=postgresql://healthpal_app:your_secure_password_here@localhost:5432/healthpal_hospital
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthpal_hospital
DB_USER=healthpal_app
DB_PASSWORD=your_secure_password_here
*/

-- 4. SETUP INSTRUCTIONS

/*
To set up the database:

1. Install PostgreSQL 13+ on your system
2. Connect as superuser: psql -U postgres
3. Run the database creation commands above
4. Connect to the new database: \c healthpal_hospital
5. Run the schema.sql file: \i schema.sql
6. Optionally run procedures.sql: \i procedures.sql

Command line setup:
psql -U postgres -c "CREATE DATABASE healthpal_hospital;"
psql -U postgres -c "CREATE USER healthpal_app WITH PASSWORD 'your_secure_password_here';"
psql -U postgres -d healthpal_hospital -c "GRANT ALL PRIVILEGES ON DATABASE healthpal_hospital TO healthpal_app;"
psql -U healthpal_app -d healthpal_hospital -f schema.sql
psql -U healthpal_app -d healthpal_hospital -f procedures.sql
*/

-- 5. SAMPLE CONNECTION TEST QUERY
-- Use this to test your database connection
SELECT 
    'Database connection successful!' as message,
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    now() as current_timestamp;

-- 6. SAMPLE DATA VALIDATION QUERIES
-- Run these to verify your setup

-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT 'Users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'Patients', count(*) FROM patients
UNION ALL
SELECT 'Doctors', count(*) FROM doctors
UNION ALL
SELECT 'Visits', count(*) FROM visits
UNION ALL
SELECT 'Medical History', count(*) FROM medical_history
UNION ALL
SELECT 'Prescriptions', count(*) FROM prescriptions;

-- Check views were created
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check functions/procedures were created
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- 7. BACKUP AND RESTORE COMMANDS

/*
To backup the database:
pg_dump -U healthpal_app -h localhost healthpal_hospital > healthpal_backup.sql

To restore from backup:
psql -U healthpal_app -h localhost healthpal_hospital < healthpal_backup.sql

To backup only schema:
pg_dump -U healthpal_app -h localhost --schema-only healthpal_hospital > healthpal_schema_only.sql

To backup only data:
pg_dump -U healthpal_app -h localhost --data-only healthpal_hospital > healthpal_data_only.sql
*/

-- 8. PERFORMANCE OPTIMIZATION SETTINGS

-- Recommended PostgreSQL configuration for this application
/*
Add these to your postgresql.conf file:

# Memory settings
shared_buffers = 256MB
work_mem = 16MB
maintenance_work_mem = 64MB

# Connection settings
max_connections = 100

# Logging settings
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000

# Performance settings
random_page_cost = 1.1
effective_cache_size = 1GB
*/

-- 9. MONITORING QUERIES

-- Check current connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE datname = 'healthpal_hospital';

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;
