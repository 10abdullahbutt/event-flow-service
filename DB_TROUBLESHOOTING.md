# Database Connection Troubleshooting Guide

## EnterpriseDB PostgreSQL Connection Issues

If you installed EnterpriseDB (not Homebrew PostgreSQL), it might use different default settings.

### Step 1: Find Your PostgreSQL Port

EnterpriseDB might be running on a different port. Check common ports:

```bash
# Check if PostgreSQL is listening on common ports
lsof -i :5432  # Default PostgreSQL port
lsof -i :5433  # Common EnterpriseDB port
lsof -i :5444  # Another EnterpriseDB port

# Or check all listening ports
netstat -an | grep LISTEN | grep -E '543[0-9]'
```

### Step 2: Find Your PostgreSQL User

EnterpriseDB might use a different default user:
- `postgres` (standard)
- `enterprisedb` (EnterpriseDB default)
- `edb` (EnterpriseDB short)

### Step 3: Test Connection

1. **Test with the script:**
   ```bash
   node test-db-connection.js
   ```

2. **Test with psql (if available):**
   ```bash
   # Try different ports and users
   psql -h localhost -p 5432 -U postgres
   psql -h localhost -p 5433 -U enterprisedb
   psql -h localhost -p 5432 -U edb
   ```

3. **Check EnterpriseDB installation location:**
   ```bash
   # EnterpriseDB is often installed in:
   /Library/PostgreSQL/15/bin/psql
   /opt/PostgreSQL/15/bin/psql
   /usr/local/edb/bin/psql
   ```

### Step 4: Create .env File

Once you know your connection details, create a `.env` file:

```env
# Your EnterpriseDB settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432          # Change if different
POSTGRES_USER=postgres      # Change if different (try: enterprisedb, edb)
POSTGRES_PASSWORD=your_password
POSTGRES_DB=audit_db

PORT=3000
NODE_ENV=development
```

### Step 5: Start PostgreSQL Service

If PostgreSQL isn't running, start it:

**macOS (EnterpriseDB):**
```bash
# Check if service is running
sudo launchctl list | grep postgres

# Start service (adjust path if needed)
sudo launchctl load /Library/LaunchDaemons/com.edb.postgresql-*.plist

# Or use EnterpriseDB's pg_ctl
/Library/PostgreSQL/15/bin/pg_ctl -D /Library/PostgreSQL/15/data start
```

**Check service status:**
```bash
# Find PostgreSQL data directory
ps aux | grep postgres

# Or check EnterpriseDB installation
ls -la /Library/PostgreSQL/
```

### Step 6: Create Database (if needed)

If the database doesn't exist:

```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U postgres

# Create database
CREATE DATABASE audit_db;

# Grant permissions (if needed)
GRANT ALL PRIVILEGES ON DATABASE audit_db TO postgres;

# Exit
\q
```

### Common Issues

#### Issue 1: "Connection refused"
- PostgreSQL service is not running
- Wrong port number
- Firewall blocking connection

**Solution:**
```bash
# Check if service is running
ps aux | grep postgres

# Check port
lsof -i :5432
```

#### Issue 2: "Authentication failed"
- Wrong username or password
- EnterpriseDB uses different default user

**Solution:**
- Try username: `enterprisedb` or `edb` instead of `postgres`
- Check EnterpriseDB installation for default credentials
- Reset password if needed

#### Issue 3: "Database does not exist"
- Database needs to be created manually

**Solution:**
```bash
# Connect and create
psql -h localhost -p 5432 -U postgres
CREATE DATABASE audit_db;
```

#### Issue 4: "Permission denied"
- User doesn't have permissions

**Solution:**
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE audit_db TO your_user;
```

### Quick Test Commands

```bash
# 1. Test connection with Node.js script
node test-db-connection.js

# 2. Test with psql (if in PATH)
psql -h localhost -p 5432 -U postgres -d postgres

# 3. Check if port is open
nc -zv localhost 5432

# 4. Check PostgreSQL processes
ps aux | grep postgres
```

### EnterpriseDB Specific Notes

1. **Installation Path:** Usually `/Library/PostgreSQL/[version]/`
2. **Default User:** Often `enterprisedb` or `edb`
3. **Default Port:** Usually `5432`, but can be `5433` or `5444`
4. **Service Management:** Uses `launchctl` on macOS
5. **Config File:** Usually in `/Library/PostgreSQL/[version]/data/postgresql.conf`

### Alternative: Use Docker PostgreSQL

If EnterpriseDB is causing issues, you can use Docker:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=audit_db \
  -p 5432:5432 \
  postgres:15
```

Then use these `.env` settings:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=audit_db
```

### Still Having Issues?

1. Check EnterpriseDB documentation for your specific version
2. Check PostgreSQL logs (usually in data directory)
3. Verify firewall settings
4. Try connecting from a PostgreSQL client (pgAdmin, DBeaver) to verify credentials

