# Optional Node backend

The public site is a static export on GitHub Pages, so this folder is **not part of
the deployed build**. It is kept here so the project can be upgraded to a full
server deployment (Postgres + email) without rewriting anything.

## What's inside

| Path | Purpose |
|------|---------|
| `api/health/route.ts` | `GET /api/health` – checks the database connection |
| `api/orders/route.ts` | `POST /api/orders` – validates, stores and emails an order; `GET` lists orders |
| `db/schema.ts` | Drizzle `orders` table definition |
| `db/index.ts` | Postgres connection pool |
| `lib/emailTemplate.ts` | HTML email sent to the café |
| `drizzle.config.json` | Drizzle Kit config (schema points at `db/schema.ts`) |

## Enabling it

1. Move the code back into the Next.js `src/` tree:

   ```bash
   mkdir -p src/app/api src/db
   cp -r backend/api/* src/app/api/
   cp -r backend/db src/db
   cp backend/lib/emailTemplate.ts src/lib/
   ```

2. Rewrite imports in the copied files: `@backend/db` → `@/db`,
   `@backend/lib/emailTemplate` → `@/lib/emailTemplate`, `@backend/db/schema` → `@/db/schema`.

3. Set `DATABASE_URL`, `SMTP_*` and `ORDER_EMAIL` (see the main README).

4. Create the table and start the server:

   ```bash
   npx drizzle-kit push --config backend/drizzle.config.json
   npm run dev
   ```

The order form already posts to `/api/orders` when `NEXT_PUBLIC_ORDERS_API` is not
set to an empty string at build time, so no frontend change is needed.
