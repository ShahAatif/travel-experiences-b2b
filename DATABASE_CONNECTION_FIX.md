# Database Connection Issue & Fix

## Current Problem
The application cannot connect to PostgreSQL due to authentication failure:
```
Authentication failed against database server at 127.0.0.1, the provided database credentials for postgres are not valid.
```

## Root Cause
The `.env` file contains:
```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/travel_experiences_db?sslmode=disable
```

But the PostgreSQL server:
1. Username `postgres` exists
2. Password is NOT `postgres` 
3. Uses `scram-sha-256` authentication method
4. Listening on port 5432 (confirmed)

## Solutions

### Solution 1: Find Correct Password (Recommended)
1. Locate PostgreSQL password (may be in Windows Credential Manager, setup docs, or environment)
2. Update `.env`:
   ```diff
   - DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/travel_experiences_db?sslmode=disable
   + DATABASE_URL=postgresql://postgres:[ACTUAL_PASSWORD]@127.0.0.1:5432/travel_experiences_db?sslmode=disable
   ```

### Solution 2: Reset PostgreSQL Password (Requires Admin)
1. Connect as Windows admin or service account
2. Reset postgres password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_secure_password';
   ```
3. Update `.env` with new password

### Solution 3: Trust Authentication (Development Only)
1. Edit `pg_hba.conf` (typically `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`)
2. Change auth method from `scram-sha-256` to `trust` for local connections:
   ```diff
   - host    all             all             127.0.0.1/32            scram-sha-256
   + host    all             all             127.0.0.1/32            trust
   - host    all             all             ::1/128                 scram-sha-256
   + host    all             all             ::1/128                 trust
   ```
3. Restart PostgreSQL service: `net stop postgresql-x64-18 && net start postgresql-x64-18`
4. Keep `.env` as-is

### Solution 4: Create New User
1. Connect to PostgreSQL (as admin/service account):
   ```sql
   CREATE USER traveluser WITH PASSWORD 'securepassword';
   CREATE DATABASE travel_experiences_db;
   GRANT ALL PRIVILEGES ON DATABASE travel_experiences_db TO traveluser;
   ```
2. Update `.env`:
   ```
   DATABASE_URL=postgresql://traveluser:securepassword@127.0.0.1:5432/travel_experiences_db?sslmode=disable
   ```

## Verification
After applying fix, test with:
```bash
cd E:\travel-experiences-b2b
npx prisma migrate dev --name init
npx prisma db seed
```

## Security Notes
- Solution 3 (trust) is for development only - never use in production
- Always use strong, unique passwords for database users
- Consider using connection pooling in production
