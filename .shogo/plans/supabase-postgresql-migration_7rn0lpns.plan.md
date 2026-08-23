---
name: "Supabase PostgreSQL Migration"
overview: "Migrate the Hakuna Matata POS app from local SQLite to Supabase PostgreSQL. Changes: update Prisma schema provider, switch DB client from LibSQL adapter to standard PrismaClient with connection URL, create .env with DATABASE_URL, regenerate schema, push to Supabase, and seed existing data."
createdAt: "2026-08-06T16:00:49.410Z"
status: pending
todos:
  - id: update-env
    content: "Create .env with DATABASE_URL pointing to Supabase PostgreSQL"
    status: pending
  - id: update-schema-provider
    content: "Change prisma/schema.prisma provider from sqlite to postgresql"
    status: pending
  - id: update-db-client
    content: "Update src/lib/db.ts — remove PrismaLibSql adapter, use standard PrismaClient with datasourceUrl"
    status: pending
  - id: remove-libsql-dep
    content: "Remove @prisma/adapter-libsql from package.json"
    status: pending
  - id: regenerate-prisma
    content: "Run prisma generate and shogo generate to rebuild client for PostgreSQL"
    status: pending
  - id: push-schema
    content: "Push schema to Supabase with prisma db push"
    status: pending
  - id: seed-data
    content: "Seed existing data (menu, tables, staff) into Supabase"
    status: pending
  - id: verify-routes
    content: "Verify all API routes work against Supabase database"
    status: pending
---

# Supabase PostgreSQL Migration

## Migration Plan: SQLite → Supabase PostgreSQL

### Why
- SQLite is local-only; Supabase gives you persistent cloud storage, a data dashboard, and multi-device access.
- Prisma 7 supports this natively — just swap the provider and connection string.

### Files to modify

1. **`.env`** (create)
   ```
   DATABASE_URL=postgresql://postgres:Hakunamatata123@db.oxvxoddgbdlypvkwjfmq.supabase.co:5432/postgres
   ```

2. **`prisma/schema.prisma`** — Change provider:
   ```diff
   datasource db {
   -  provider = "sqlite"
   +  provider = "postgresql"
   }
   ```

3. **`src/lib/db.ts`** — Remove LibSQL adapter, use standard client:
   ```typescript
   import { PrismaClient } from '../generated/prisma/client'
   
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
   
   export const prisma = globalForPrisma.prisma ?? new PrismaClient({
     datasourceUrl: process.env.DATABASE_URL,
     log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
   })
   
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

4. **`package.json`** — Remove `@prisma/adapter-libsql` from dependencies (no longer needed)

5. **Regenerate & push:**
   - `bun x shogo generate` — rebuilds Prisma client for PostgreSQL
   - `bun x prisma db push` — creates all tables in Supabase

6. **Seed data** — Re-run the existing seed script (`scripts/seed-menu.ts`) to populate menu items, tables, and staff in Supabase.

### Verification
- `curl http://localhost:3001/health` — server healthy
- `curl http://localhost:8080/api/pos/tables` — tables returned from Supabase
- `curl http://localhost:8080/api/pos/menu` — menu items returned from Supabase
- `curl http://localhost:8080/api/pos/orders` — orders endpoint works
- Build log shows no errors

### Risk
- All local SQLite data (existing orders) will not migrate automatically. Menu, tables, and staff will be re-seeded. Historical orders will be lost — this is acceptable for a fresh setup.
- The Supabase database password is now in `.env` which ships to the server. For production, use Supabase's connection pooler with PgBouncer.

<!-- :::summary::: -->
## Supabase PostgreSQL Migration

### What's changing
The Hakuna Matata POS app is moving from a local SQLite database to Supabase PostgreSQL. This gives you persistent cloud storage, a shared data dashboard, and multi-device access instead of a single-machine database.

### What you need to know

**Timeline & effort**
- Configuration changes to 4 files
- Database regeneration and data reseeding
- Minimal downtime if coordinated properly

**What gets created**
- Cloud-hosted PostgreSQL database on Supabase
- All POS tables (menu, tables, staff, orders) recreated in the cloud
- Menu items, seating configuration, and staff lists re-populated from existing seed data

**What's lost**
- Existing local order history will not carry over (this is acceptable for a fresh deployment)
- Any local-only data that hasn't been explicitly seeded will be gone

**How we'll verify it works**
- Server health check passes
- Menu items load from the cloud
- Table management loads from the cloud
- Orders endpoint responds correctly
- Build completes with no errors

### Production readiness
For live deployment, the database password management will need to be tightened using Supabase's connection pooler to avoid storing credentials in plain text in `.env`.
<!-- :::end-summary::: -->
