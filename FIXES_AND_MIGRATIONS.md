# Fixes and Migrations Summary

## ✅ Fixed Issues

### 1. UUID Import Error (ES Module Issue)
**Problem:** The `uuid` package (v13) is ESM-only and caused `ERR_REQUIRE_ESM` error when using CommonJS.

**Solution:** Replaced `uuid` package with Node.js built-in `crypto.randomUUID()` (available in Node.js 14.17+).

**Changes:**
- `src/producer/producer.controller.ts`: Changed from `import { v4 as uuidv4 } from 'uuid'` to `import { randomUUID } from 'crypto'`
- Uses native Node.js API, no external dependency needed

**Note:** The `uuid` package in `package.json` can be removed if not used elsewhere, but it's harmless to leave it.

---

## 📊 Database Migrations Setup

### Migration Strategy

The project now uses a **hybrid approach**:

- **Development (`NODE_ENV !== 'production'`)**: 
  - Uses `synchronize: true` for automatic schema sync
  - Convenient for rapid development
  - Migrations can still be generated and tested

- **Production (`NODE_ENV === 'production'`)**: 
  - Uses `synchronize: false` (migrations only)
  - `migrationsRun: true` - automatically runs migrations on startup
  - Safe, controlled schema changes

### Files Created

1. **`src/data-source.ts`**
   - TypeORM DataSource configuration for CLI commands
   - Used by migration scripts
   - Separate from app.module.ts for CLI usage

2. **`src/migrations/1699999999999-InitialSchema.ts`**
   - Initial migration creating both tables
   - Creates `audit_logs` and `notifications` tables
   - Sets up indexes and unique constraints
   - Includes `up()` and `down()` methods for reversibility

3. **`MIGRATIONS.md`**
   - Complete migration guide
   - Commands, workflows, best practices
   - Troubleshooting tips

### Migration Commands Added

```bash
# Generate migration from entity changes
yarn migration:generate src/migrations/MigrationName

# Create empty migration
yarn migration:create src/migrations/MigrationName

# Run pending migrations
yarn migration:run

# Revert last migration
yarn migration:revert

# Show migration status
yarn migration:show

# Sync schema (dev only)
yarn schema:sync

# Drop schema (dangerous!)
yarn schema:drop
```

### How Migrations Work

#### Development Workflow:
```bash
# 1. Make changes to entities
# 2. Generate migration
yarn migration:generate src/migrations/AddNewColumn

# 3. Review and edit migration file
# 4. Run migration
yarn migration:run
```

#### Production Workflow:
```bash
# Option 1: Auto-run (current setup)
NODE_ENV=production yarn start:prod
# Migrations run automatically on startup

# Option 2: Manual (recommended)
NODE_ENV=production yarn migration:run
NODE_ENV=production yarn start:prod
```

### Migration File Structure

Migrations are in `src/migrations/` with naming pattern:
```
{timestamp}-{MigrationName}.ts
```

Example:
- `1699999999999-InitialSchema.ts`
- `1700000000000-AddIndexToNotifications.ts`

### Key Features

1. **Reversible**: All migrations include `down()` method for rollback
2. **Indexed**: Proper indexes on frequently queried columns
3. **Unique Constraints**: `eventId` has unique constraint for idempotency
4. **Transaction Safe**: Migrations run in transactions

### Current Schema

**audit_logs table:**
- `id` (uuid, primary key)
- `eventId` (varchar, unique)
- `userId` (varchar, indexed)
- `type` (varchar)
- `payload` (jsonb)
- `createdAt` (varchar)
- `ingestedAt` (timestamp)

**notifications table:**
- `id` (uuid, primary key)
- `eventId` (varchar, unique)
- `userId` (varchar, indexed)
- `type` (varchar)
- `payload` (jsonb)
- `status` (varchar, default: 'pending', indexed)
- `createdAt` (timestamp, indexed)

---

## 🚀 Quick Start

### Development
```bash
# Start with auto-sync (no migrations needed)
yarn start:dev
```

### Production
```bash
# Build
yarn build

# Run migrations (auto-runs on startup, or manually)
NODE_ENV=production yarn migration:run

# Start
NODE_ENV=production yarn start:prod
```

---

## 📝 Notes

1. **Node.js Version**: `crypto.randomUUID()` requires Node.js 14.17+ (you mentioned Node 18+, so you're good!)

2. **Migration Paths**: 
   - Development: `src/migrations/*.ts` (TypeScript)
   - Production: `dist/migrations/*.js` (compiled JavaScript)

3. **Database Connection**: Migrations use the same environment variables as the app:
   - `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

4. **Backup**: Always backup production database before running migrations!

---

## ✅ Verification

To verify everything works:

```bash
# 1. Build (should succeed)
yarn build

# 2. Check migration status
yarn migration:show

# 3. Run migrations (if any pending)
yarn migration:run

# 4. Start app
yarn start:dev
```

All fixes are complete and the application should now run without the UUID error!

