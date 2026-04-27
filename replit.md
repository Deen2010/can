# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the **Salon** artifact: a friseur website with online appointment booking, services catalog, stylist directory, and an admin dashboard. Editorial baby-blue aesthetic (Playfair Display + DM Sans), German UI.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: cookie-based sessions (bcryptjs hashing) — `customers` + `sessions` tables; cookie `goethe_cuts_session`, 30-day TTL
- **E-Mail**: nodemailer via SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`); no-op stub when not configured

## Auth flow

- Customers may register (POST `/api/auth/register`) or check out as guests
- Booking confirmation emails are sent on `POST /api/appointments`
- `/meine-termine` lists `?mine=true` appointments for the logged-in customer
- Admin gate at `/admin` is unrelated (password "cankann" in sessionStorage)
- Admin dashboard offers two views for "Alle Termine": **Kalender** (week grid 09–22h, Mon–Sun, click block for detail panel with confirm/cancel) and **Liste** (filterable status list)
- Admin **Kunden** section lists all registered customers (with appointment counts) and allows inline edit of name/email/phone, setting a new password (invalidates that customer's sessions), and deletion (preserves appointments by nulling `customer_id`). Backed by `GET/PATCH/DELETE /api/customers` and `POST /api/customers/:id/password`.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
