# Database Migration Guide - External PostgreSQL

This document explains the changes made to migrate from local PostgreSQL to an external PostgreSQL server with a custom schema.

## Overview

- **Previous Setup**: Local PostgreSQL on localhost:5432, using `public` schema
- **New Setup**: External PostgreSQL on 195.244.38.27:5434, using `survey_test` schema
- **Database**: qumpara_test4
- **User**: qumpara
- **Schema**: survey_test

## Changes Made

### 1. Database Configuration

#### docker-compose.yml
Updated environment variables for the API service:
```yaml
environment:
  DATABASE_URL: postgresql://qumpara:nobium@195.244.38.27:5434/qumpara_test4
  DATABASE_SCHEMA: survey_test
  DATABASE_MIGRATE: "false"
```

#### api/ormconfig_postgres.json
Updated connection parameters:
```json
{
  "host": "195.244.38.27",
  "port": 5434,
  "username": "qumpara",
  "password": "nobium",
  "database": "qumpara_test4",
  "schema": "survey_test"
}
```

### 2. TypeORM Configuration

#### api/src/app.imports.ts
Added schema configuration to TypeORM:
```typescript
// Parse DATABASE_MIGRATE properly (it's a string "true" or "false")
const migrateString = configService.get<string>('DATABASE_MIGRATE', 'true')
const migrationsRun = migrateString === 'true'

// Log schema configuration for debugging
const schema = configService.get<string>('DATABASE_SCHEMA', 'public')
console.log('[TypeORM] Schema configuration:', schema)
console.log('[TypeORM] Migrations enabled:', migrationsRun)

return ({
  name: 'ohmyform',
  synchronize: false,
  type,
  url: configService.get<string>('DATABASE_URL'),
  schema,  // Added schema parameter
  // ... other config
  migrationsRun,  // Fixed boolean parsing
})
```

### 3. Entity Schema Configuration

All entity decorators were updated to explicitly specify the schema:

**Before:**
```typescript
@Entity({ name: 'form' })
export class FormEntity {
```

**After:**
```typescript
@Entity({ name: 'form', schema: 'survey_test' })
export class FormEntity {
```

Updated entities:
- form.entity.ts
- form.field.entity.ts
- form.field.logic.entity.ts
- form.field.option.entity.ts
- form.hook.entity.ts
- form.notification.entity.ts
- visitor.entity.ts
- page.entity.ts
- page.button.entity.ts
- submission.entity.ts
- submission.field.entity.ts
- user.entity.ts

### 4. Database Schema Fixes

#### Missing Column: is_active
The external database was missing the `is_active` column that was added in a recent migration. This column is used for soft deletes.

**Manual Migration Applied:**
```sql
ALTER TABLE survey_test.form 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
```

## Database Schema

The `survey_test` schema contains the following tables:

1. **form** - Form definitions
2. **form_field** - Form field definitions
3. **form_field_logic** - Conditional logic for fields
4. **form_field_option** - Multiple choice options
5. **form_hook** - Webhook integrations
6. **form_notification** - Email notifications
7. **form_visitor** - Visitor tracking
8. **page** - Start/end pages
9. **page_button** - Page button configurations
10. **submission** - Form submissions
11. **submission_field** - Individual field responses
12. **user** - User accounts
13. **migrations** - TypeORM migration history
14. **typeorm_metadata** - TypeORM metadata

## Verification Steps

### 1. Check Database Connection
```bash
docker run --rm postgres:14-alpine psql "postgresql://qumpara:nobium@195.244.38.27:5434/qumpara_test4" -c "\dt survey_test.*"
```

### 2. Check Schema Permissions
```sql
GRANT ALL ON SCHEMA survey_test TO qumpara;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA survey_test TO qumpara;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA survey_test TO qumpara;
```

### 3. Test API Connection
```bash
# Test status endpoint
curl http://localhost:8080/api/status

# Test login
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"root!"}'

# Test forms listing (requires auth token)
curl -X GET http://localhost:8080/api/forms \
  -H "Authorization: Bearer <token>"
```

## Troubleshooting

### Issue: "relation 'form' does not exist"
**Cause**: TypeORM not using schema prefix in queries
**Solution**: Add `schema: 'survey_test'` to entity decorators

### Issue: "column f.is_active does not exist"
**Cause**: External database missing recent migration
**Solution**: Run manual migration to add is_active column

### Issue: Migrations running despite DATABASE_MIGRATE="false"
**Cause**: ConfigService.get<boolean>() treats string "false" as truthy
**Solution**: Parse string value explicitly:
```typescript
const migrateString = configService.get<string>('DATABASE_MIGRATE', 'true')
const migrationsRun = migrateString === 'true'
```

## Future Migrations

When creating new migrations that will run against the external database:

1. **Disable automatic migrations** in docker-compose.yml:
   ```yaml
   DATABASE_MIGRATE: "false"
   ```

2. **Run migrations manually** with schema prefix:
   ```sql
   ALTER TABLE survey_test.table_name ADD COLUMN ...
   ```

3. **Test migrations** on a development database first

4. **Update all entities** if adding new tables or columns

## Rollback Procedure

If you need to revert to the local database:

1. Update docker-compose.yml:
   ```yaml
   DATABASE_URL: postgresql://postgres:password@localhost:5432/ohmyform
   DATABASE_SCHEMA: public
   ```

2. Update api/ormconfig_postgres.json to local settings

3. Remove schema parameter from entity decorators (optional)

4. Restart containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Current Status

✅ **WORKING**
- Database connection to external server (195.244.38.27:5434)
- Schema configuration (survey_test)
- JWT Authentication
- User queries
- Form queries
- All REST API endpoints

⚠️ **NOTES**
- Migrations are disabled (DATABASE_MIGRATE=false)
- Any new schema changes must be applied manually
- The is_active column was added manually (not through migration)

## Contact

For issues or questions about the database migration, refer to:
- API logs: `docker-compose logs api`
- Database connection: Check api/src/app.imports.ts
- Entity schemas: Check api/src/entity/*.entity.ts
