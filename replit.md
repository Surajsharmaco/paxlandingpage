# Punar Axis Therapy

Public Ayurveda and physiotherapy landing pages with a protected employee attendance workspace for the Sector 141 clinic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `SESSION_SECRET` — used to HMAC session token hashes; never expose this value
- Optional first-admin bootstrap env: `ADMIN_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` (preferred secure secret, minimum 12 characters), `ADMIN_NAME`; `ADMIN_INITIAL_PASSWORD` remains a legacy fallback
- Optional attendance defaults: `CLINIC_LATITUDE`, `CLINIC_LONGITUDE`, legacy `GEOFENCE_RADIUS_M`, `MAX_GPS_ACCURACY_M`, `LATE_AFTER_MINUTES`, `ATTENDANCE_RETENTION_DAYS`, `PRIVACY_NOTICE_VERSION`, `CLINIC_TIMEZONE`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Public landing UI: `artifacts/punar-axis-therapy/src/pages/home.tsx`
- Protected admin/team UI: `artifacts/punar-axis-therapy/src/pages/portal.tsx`
- Attendance API: `artifacts/api-server/src/routes/attendance.ts`
- App-managed sessions and password hashing: `artifacts/api-server/src/lib/auth.ts`
- Attendance database source of truth: `lib/db/src/schema/attendance.ts`
- API contract: `lib/api-spec/openapi.yaml`

## Architecture decisions

- The public site and protected portals share the web artifact; `/api` remains a separate Express artifact routed by the workspace proxy.
- Employee credentials use app-managed `scrypt` hashes and database-backed opaque sessions; the API enforces role/ownership authorization.
- Attendance finalization and check-out are atomic operations: each uses a short-lived purpose-specific server nonce, server timestamp, one-time consent, one-time GPS accuracy validation and two camera-only image payloads; office geofencing is not enforced.
- Attendance evidence is stored as protected PostgreSQL binary records because App Storage provisioning was unavailable in this workspace; evidence endpoints are admin-only and never included in CSV exports.
- Browser GPS and camera signals are risk inputs, not proof of identity or spoof prevention; the system does not perform continuous tracking or facial recognition.

## Product

- Public visitors can learn about Ayurveda, physiotherapy and rehab services and contact the clinic through the existing conversion flows.
- Super Admins can manage team access, attendance records, corrections, separate check-in/check-out evidence review, reports, settings, audit history and per-employee monthly attendance calendars.
- Team members can check in/out from any work location, including field visits, using a consented one-time location reading and live front/rear camera captures.

## User preferences

- Preserve the existing public landing page hierarchy, imagery and contact actions while working on the employee workspace.

## Gotchas

- Run `pnpm --filter @workspace/db run push` in development after schema changes; production schema changes are applied through the Replit Publish flow.
- Run `pnpm --filter @workspace/api-spec run codegen` after OpenAPI changes before the full typecheck.
- The first admin is created only when `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` are configured before API startup; otherwise the login UI correctly has no usable admin account.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
