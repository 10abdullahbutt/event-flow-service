# Database Migrations Guide

This project uses TypeORM migrations for database schema management. Migrations allow you to version control your database schema and apply changes safely in production.

## Migration Strategy

- **Development**: Uses `synchronize: true` for automatic schema sync (convenient for rapid development)
- **Production**: Uses migrations exclusively (`synchronize: false`) for safe, controlled schema changes

## Migration Commands

### Generate a Migration
Generate a new migration based on entity changes:
```bash
yarn migration:generate src/migrations/MigrationName
```

### Create an Empty Migration
Create a new empty migration file:
```bash
yarn migration:create src/migrations/MigrationName
```

### Run Migrations
Apply all pending migrations:
```bash
yarn migration:run
```

### Revert Last Migration
Revert the most recent migration:
```bash
yarn migration:revert
```

### Show Migration Status
Show which migrations have been run:
```bash
yarn migration:show
```

### Sync Schema (Development Only)
Sync schema directly from entities (use with caution):
```bash
yarn schema:sync
```

### Drop Schema (Dangerous!)
Drop all tables (use with extreme caution):
```bash
yarn schema:drop
```

## Migration Workflow

### 1. Development Workflow

During development, you can use `synchronize: true` which automatically syncs your entities to the database. However, it's good practice to generate migrations:

```bash
# 1. Make changes to your entities
# 2. Generate migration
yarn migration:generate src/migrations/AddNewColumnToNotification

# 3. Review the generated migration file
# 4. Run the migration
yarn migration:run
```

### 2. Production Workflow

In production, migrations are automatically run on startup if `migrationsRun: true` is set. For manual control:

```bash
# 1. Build the application
yarn build

# 2. Run migrations manually (if not auto-run)
yarn migration:run

# 3. Start the application
yarn start:prod
```

## Migration File Structure

Migrations are located in `src/migrations/` and follow this naming pattern:
```
{timestamp}-{MigrationName}.ts
```

Example:
```
1699999999999-InitialSchema.ts
1700000000000-AddIndexToNotifications.ts
```

## Migration File Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Write your migration logic here
    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD COLUMN "newColumn" varchar(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write your rollback logic here
    await queryRunner.query(`
      ALTER TABLE "notifications" 
      DROP COLUMN "newColumn"
    `);
  }
}
```

## Best Practices

1. **Always Review Generated Migrations**: TypeORM's auto-generated migrations are a starting point. Review and adjust as needed.

2. **Test Migrations**: Always test migrations in a development/staging environment before production.

3. **Write Reversible Migrations**: Always implement the `down()` method to allow rollback.

4. **Use Transactions**: TypeORM runs migrations in transactions by default, so if a migration fails, it will rollback.

5. **Version Control**: Commit migration files to version control so all team members can apply the same schema changes.

6. **Backup Before Production**: Always backup your production database before running migrations.

7. **Run Migrations Separately**: In production, consider running migrations as a separate step before deploying the application.

## Current Migrations

### InitialSchema (1699999999999)
- Creates `audit_logs` table with indexes
- Creates `notifications` table with indexes
- Sets up unique constraints on `eventId` for both tables

## Troubleshooting

### Migration Already Exists
If you get an error that a migration already exists:
```bash
# Check migration status
yarn migration:show

# If needed, manually update the migrations table in your database
```

### Migration Fails
If a migration fails:
1. Check the error message
2. Fix the migration file
3. Revert if needed: `yarn migration:revert`
4. Fix and re-run: `yarn migration:run`

### Reset Database (Development Only)
```bash
# Drop all tables
yarn schema:drop

# Re-run all migrations
yarn migration:run
```

## Environment Variables

Migrations use the same database connection as the application:
- `POSTGRES_HOST` (default: localhost)
- `POSTGRES_PORT` (default: 5432)
- `POSTGRES_USER` (default: postgres)
- `POSTGRES_PASSWORD` (default: postgres)
- `POSTGRES_DB` (default: audit_db)

## Production Deployment

For production, you have two options:

### Option 1: Auto-run Migrations (Current Setup)
Migrations run automatically on application startup when `NODE_ENV=production`:
```bash
NODE_ENV=production yarn start:prod
```

### Option 2: Manual Migration Step
1. Run migrations separately:
   ```bash
   NODE_ENV=production yarn migration:run
   ```
2. Then start the application:
   ```bash
   NODE_ENV=production yarn start:prod
   ```

Option 2 is recommended for production as it gives you more control and visibility.

