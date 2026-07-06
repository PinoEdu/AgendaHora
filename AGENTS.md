# Agent Notes

## Current Sources Of Truth
- `README.md` is still the default Next template; trust `package.json`, `prisma.config.ts`, `docker-compose.yml`, and source code over README prose.
- `CLAUDE.md` only points to this file.
- This app uses Next.js `16.2.10`, React `19.2`, App Router, Tailwind v4, shadcn CLI preset, Prisma `7.8`, Auth.js v5 beta, and Vitest.

## Commands
- Use npm; `package-lock.json` is present.
- Start local Postgres first when touching Prisma or booking flows: `npm run db:up`.
- Dev server: `npm run dev`.
- Full verification used in this repo: `npm run lint`, `npx tsc --noEmit`, `npm run prisma:validate`, `npm run test -- --run`, `npm run build`.
- Focused test: `npm run test -- --run src/tests/<area>/<file>.test.ts`.
- Prisma: `npm run prisma:migrate -- --name <name>`, then `npm run prisma:generate`; seed categories with `npm run db:seed`.

## Environment And Database
- Required `.env` keys are in `.env.example`: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`.
- Docker Compose exposes Postgres at `localhost:5432` with database/user/password all `agendahora`.
- Prisma config loads `.env` via `prisma.config.ts`; datasource URL is not declared in `schema.prisma`.
- Prisma Client is generated to `src/generated/prisma`; never edit generated files.
- Prisma 7 uses `provider = "prisma-client"` plus `@prisma/adapter-pg`; import `PrismaClient` from `@/generated/prisma/client`, not from `@prisma/client`.

## Architecture
- Route groups: public pages live under `src/app/(public)`, auth pages under `src/app/(auth)`, customer pages under `src/app/(customer)`, and owner dashboard under `src/app/dashboard`.
- Domain logic is under `src/features/*`; Prisma access should stay in server-side queries/actions/services, not in Client Components.
- Public booking flow uses `GET /api/availability` and `POST /api/bookings`.
- Auth uses Auth.js Credentials + JWT sessions in `src/auth.ts`; roles are `CUSTOMER` and `BUSINESS_OWNER`.

## Booking And Availability Rules
- `Business.status` must be `ACTIVE` for public availability and booking.
- `BookableResource` must be associated to a `Service` through `ResourceService` before it can be booked.
- Availability rules store local minutes of day; `BlockedTime` and `Booking.startsAt/endsAt` are stored as UTC `DateTime`.
- Timezone conversion lives in `src/lib/dates.ts` and uses `date-fns-tz`; business timezone defaults to `America/Santiago`.
- Only `PENDING` and `CONFIRMED` bookings block availability; cancelled/completed/no-show bookings do not.
- Booking creation revalidates availability inside a Prisma transaction in `src/features/bookings/booking.service.ts`.

## Client/Server Boundary Gotchas
- Do not import files that import `@/lib/prisma` or `@/lib/env` into Client Components; this pulls Node/Postgres modules into the browser build.
- Keep client-safe helpers in separate files like `*-format.ts` or pure rule files like `booking-rules.ts`.
- Generated Prisma `Decimal` values must be converted to strings before passing data into Client Components.

## Tests
- Vitest runs in Node and has `@` aliased to `src` via `vitest.config.ts`.
- Existing tests are unit tests for pure booking/availability rules; avoid making them require `DATABASE_URL` or a live database.
