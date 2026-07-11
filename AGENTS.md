# Agent Notes

## Sources Of Truth
- Trust executable config and source over prose: `package.json`, `prisma.config.ts`, `docker-compose.yml`, `src/*`, then `README.md`.
- `CLAUDE.md` only points here.
- Stack is Next.js `16.2.10`, React `19.2`, App Router, Tailwind v4, Prisma `7.8`, Auth.js v5 beta, Resend, and Vitest.

## Commands
- Use npm; `package-lock.json` is present.
- Dev server: `npm run dev`.
- Local Postgres: `npm run db:up` / `npm run db:down`; Docker exposes DB/user/password `agendahora` at `localhost:5432`.
- Full verification used here: `npm run lint`, `npx tsc --noEmit`, `npm run prisma:validate`, `npm run test -- --run`, `npm run build`.
- Focused test: `npm run test -- --run src/tests/<area>/<file>.test.ts`.
- Prisma flow: `npm run prisma:migrate -- --name <name>`, then `npm run prisma:generate`; seed demo data with `npm run db:seed`.

## Environment
- Required local keys are in `.env.example`: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`; email keys are optional for local flows.
- Prisma config loads `.env` via `prisma.config.ts`; datasource URL is not in `schema.prisma`.
- Prisma Client is generated to `src/generated/prisma`; never edit generated files.
- Prisma 7 uses `provider = "prisma-client"` plus `@prisma/adapter-pg`; import `PrismaClient` from `@/generated/prisma/client`, not `@prisma/client`.
- Resend test mode with `EMAIL_FROM="AgendaHora <onboarding@resend.dev>"` can only send to the Resend account email; use `EMAIL_TEST_RECIPIENT` to redirect all outgoing emails during development.
- Do not commit real API keys in `.env.example` or docs.

## Architecture
- Route groups: public pages in `src/app/(public)`, auth in `src/app/(auth)`, customer in `src/app/(customer)`, owner dashboard in `src/app/dashboard`, APIs in `src/app/api`.
- Domain code lives under `src/features/*`; Prisma access should stay in server-side queries/actions/services, not Client Components.
- `src/app/layout.tsx` renders the global auth-aware navbar; because it calls `auth()`, routes build as dynamic.
- Navbar code: `src/components/layout/app-navbar.tsx` server-side session/role logic, `app-navbar-links.tsx` client-side active link state.
- Dashboard visual primitives live in `src/components/dashboard/dashboard-shell.tsx`; reuse them for dashboard child pages instead of reintroducing slate/default cards.

## Booking And Availability Rules
- Public availability/booking requires `Business.status === ACTIVE`.
- `BookableResource` must be associated to `Service` through `ResourceService` before it can be booked.
- Availability rules store local minutes of day; `BlockedTime` and `Booking.startsAt/endsAt` are UTC `DateTime`.
- Timezone conversion lives in `src/lib/dates.ts`; business timezone defaults to `America/Santiago`.
- Only `PENDING` and `CONFIRMED` bookings block availability; cancelled/completed/no-show do not.
- Booking creation revalidates availability inside a Prisma transaction in `src/features/bookings/booking.service.ts`.
- Confirmation emails are sent after booking creation in `src/app/api/bookings/route.ts`; email failure must not roll back or fail the reservation.

## Client/Server Boundary Gotchas
- Do not import files that import `@/lib/prisma`, `@/lib/env`, or `@/lib/email` into Client Components.
- Keep client-safe helpers in separate pure files such as `*-format.ts`, `booking-rules.ts`, and `password-rules.ts`.
- Convert Prisma `Decimal` values to strings before passing them into Client Components.
- `callbackUrl` form values can be `null`; auth validators intentionally normalize missing/empty callback URLs to `undefined`.

## Auth, Demo Data, And Email
- Auth uses Auth.js Credentials + JWT in `src/auth.ts`; roles are `CUSTOMER` and `BUSINESS_OWNER`.
- Logout is a server action in `src/features/auth/auth.actions.ts`; use `LogoutButton` rather than duplicating sign-out forms.
- Seed credentials: owner `owner@agendahora.test` / `Demo123456`; customer `cliente@agendahora.test` / `Demo123456`; demo business slug `barberia-norte-demo`.
- Password strength rules are shared in `src/features/auth/password-rules.ts`; keep register UI and backend validation in sync through that file.

## Tests
- Vitest runs in Node and aliases `@` to `src` via `vitest.config.ts`.
- Existing tests are pure booking/availability unit tests; do not make them require `DATABASE_URL`, Resend, or a live database.
