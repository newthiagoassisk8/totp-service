# 📘 Migrations Guide - Drizzle ORM

## 🎯 How to Create Incremental Migrations

### Step by Step:

#### 1. **Modify the Schema**
Edit `src/db/schema.ts` with your changes:

```typescript
// Example: add new field
export const totps = pgTable('totps', {
    // ... existing fields
    encoding: varchar('encoding', { length: 32 }), // ← NEW FIELD
});
```

#### 2. **Generate Automatic Migration**
```bash
npx drizzle-kit generate
```

**Expected output:**
```
[✓] Your SQL migration file ➜ drizzle/0003_xxxxx.sql 🚀
```

Drizzle automatically detects:
- ✅ Added/removed columns
- ✅ Changed data types
- ✅ Created/removed indexes
- ✅ Modified constraints
- ✅ Foreign keys

#### 3. **Review the Generated Migration**
```bash
cat drizzle/000X_nome_gerado.sql
```

Example of incremental migration:
```sql
ALTER TABLE "totps" ADD COLUMN "encoding" varchar(32);
```

#### 4. **Apply the Migration**
```bash
npm run db:migrate
```

**Or use the direct command:**
```bash
npx drizzle-kit migrate
```

---

## ✅ **Your Case: `encoding` Field Added**

### What happened:

1. ✅ You added `encoding: varchar('encoding', { length: 32 })` to the schema
2. ✅ Drizzle automatically generated: `drizzle/0002_rainy_magneto.sql`
3. ✅ Migration contains: `ALTER TABLE "totps" ADD COLUMN "encoding" varchar(32);`
4. ✅ Field has already been applied to the database

### Current Status:
```sql
-- Migration created
drizzle/0002_rainy_magneto.sql

-- Content
ALTER TABLE "totps" ADD COLUMN "encoding" varchar(32);

-- Already applied to database ✅
```

---

## 🔍 Check Migration Status

### View applied migrations:
```bash
psql $DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;"
```

### View table structure:
```bash
psql $DATABASE_URL -c "\d totps"
```

### View indexes:
```bash
psql $DATABASE_URL -c "\di"
```

---

## 🚨 Troubleshooting

### Problem: "No schema changes, nothing to migrate"

**Possible causes:**
1. Schema hasn't changed since last migration
2. Change has already been applied manually
3. Drizzle cache is outdated

**Solutions:**
```bash
# Clear cache and try again
rm -rf node_modules/.drizzle
npx drizzle-kit generate
```

### Problem: "relation already exists" error

**Cause:** Migration trying to create something that already exists in the database

**Solution 1 - Mark migration as applied:**
```sql
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at)
VALUES (3, 'hash_da_migration', extract(epoch from now()) * 1000);
```

**Solution 2 - Apply only what's missing:**
Manually edit the `.sql` file and remove already executed commands.

### Problem: Missing indexes

**Check:**
```sql
\d+ table_name
```

**Create manually:**
```sql
CREATE INDEX IF NOT EXISTS index_name ON table_name (column_name);
```

---

## 📋 Best Practices

### ✅ DO:
- Always review generated migrations before applying
- Backup before migrations in production
- Use `IF NOT EXISTS` in manual changes
- Test migrations in development environment first
- Version migration files in Git

### ❌ DON'T:
- Don't edit already applied migrations
- Don't delete migration files from `drizzle/` directory
- Don't modify database manually without creating migration
- Don't apply migrations directly in production without testing

---

## 🔄 Complete Workflow

```bash
# 1. Modify schema
vim src/db/schema.ts

# 2. Generate migration
npx drizzle-kit generate

# 3. Review
cat drizzle/000X_*.sql

# 4. Apply in dev
npm run db:migrate

# 5. Test
npm run dev

# 6. Build and commit
npm run build
git add .
git commit -m "feat: add encoding field to totps"

# 7. Deploy and apply in production
# (on server)
npm run db:migrate
npm run start
```

---

## 📚 Useful Commands

```bash
# Generate migration
npx drizzle-kit generate

# Apply pending migrations
npm run db:migrate

# View status
npx drizzle-kit studio  # Visual UI (localhost:4983)

# Push schema (forces synchronization - careful!)
npx drizzle-kit push

# Introspect (generates schema from existing database)
npx drizzle-kit introspect
```

---

## ✨ Summary of Your Case

✅ **`encoding` field added successfully!**

**Migration created:** `drizzle/0002_rainy_magneto.sql`
**Generated SQL:** `ALTER TABLE "totps" ADD COLUMN "encoding" varchar(32);`
**Status:** Applied to database
**Next steps:** You can use the `encoding` field normally in your code!

**Usage example:**
```typescript
await db.insert(totps).values({
    userId: user.id,
    label: 'GitHub',
    secret: 'ABC123',
    encoding: 'base32', // ← NEW FIELD
});
```
