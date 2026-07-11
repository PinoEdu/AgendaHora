# AgendaHora

AgendaHora es una plataforma multi-negocio para reservas online de servicios locales. El MVP permite a dueños de negocio publicar servicios, recursos y disponibilidad, mientras clientes pueden explorar negocios activos y reservar horarios disponibles.

El proyecto esta pensado como una app full-stack de portafolio con reglas reales de agenda: disponibilidad semanal, bloqueos manuales, recursos compatibles por servicio, zonas horarias y validacion transaccional al crear reservas.

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma 7 con `@prisma/adapter-pg`
- Auth.js v5 beta con credenciales y sesiones JWT
- Tailwind CSS v4
- shadcn/ui CLI preset
- date-fns y date-fns-tz
- Vitest
- Docker Compose para Postgres local

## Funcionalidades

- Registro e inicio de sesion con roles `CUSTOMER` y `BUSINESS_OWNER`.
- Dashboard para dueños de negocio.
- CRUD de negocios, servicios y recursos reservables.
- Asociacion de recursos a servicios.
- Configuracion de disponibilidad semanal por recurso.
- Bloqueos manuales de horarios por negocio o recurso.
- Exploracion publica de negocios activos.
- Flujo publico de reserva con seleccion de servicio, recurso, fecha y horario.
- Validacion backend de disponibilidad antes de crear una reserva.
- Gestion de reservas para cliente y negocio.
- Cancelacion, marcado como completada y no-show.
- Seed demo completo para probar la app rapidamente.

## Requisitos

- Node.js compatible con Next.js 16
- npm
- Docker Desktop o un PostgreSQL local equivalente

## Setup Local

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno:

```bash
cp .env.example .env
```

Contenido esperado para desarrollo local:

```env
DATABASE_URL="postgresql://agendahora:agendahora@localhost:5432/agendahora?schema=public"
AUTH_SECRET="replace-with-a-secure-random-secret"
AUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_replace-with-your-resend-api-key"
EMAIL_FROM="AgendaHora <onboarding@resend.dev>"
```

`RESEND_API_KEY` y `EMAIL_FROM` habilitan emails de confirmación de reserva. Si faltan, la app funciona igual y omite el envío en desarrollo local.

3. Levantar Postgres:

```bash
npm run db:up
```

4. Ejecutar migraciones:

```bash
npm run prisma:migrate -- --name init
```

Si la base ya tiene migraciones aplicadas, este comando no deberia crear una migracion nueva.

5. Generar Prisma Client:

```bash
npm run prisma:generate
```

6. Cargar datos demo:

```bash
npm run db:seed
```

7. Iniciar servidor de desarrollo:

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Datos Demo

El seed crea categorias, usuarios demo, un negocio activo, servicios, recursos, disponibilidad, bloqueos y reservas.

Negocio demo:

```txt
Barberia Norte Demo
/businesses/barberia-norte-demo
```

Credenciales:

```txt
Dueño de negocio
Email: owner@agendahora.test
Password: Demo123456

Cliente
Email: cliente@agendahora.test
Password: Demo123456
```

El seed es seguro para re-ejecutar en desarrollo: mantiene categorias y usuarios por email, y recrea el negocio demo usando el slug `barberia-norte-demo`.

## Rutas Principales

- `/`: landing publica.
- `/businesses`: listado publico de negocios activos.
- `/businesses/[slug]`: perfil publico del negocio.
- `/businesses/[slug]/book`: flujo de reserva para clientes autenticados.
- `/login`: inicio de sesion.
- `/register`: registro.
- `/me/bookings`: reservas del cliente.
- `/dashboard`: panel del dueño de negocio.
- `/dashboard/businesses`: negocios del dueño.
- `/dashboard/businesses/[businessId]`: administracion del negocio.

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test -- --run
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate -- --name <name>
npm run db:seed
npm run db:up
npm run db:down
```

## Verificacion

Antes de cerrar cambios importantes, ejecutar:

```bash
npm run lint
npx tsc --noEmit
npm run prisma:validate
npm run test -- --run
npm run build
```

Para `npm run build`, mantener Postgres disponible. Algunas rutas publicas consultan Prisma durante el build.

## Arquitectura

La app usa route groups de Next.js:

- `src/app/(public)`: paginas publicas.
- `src/app/(auth)`: login y registro.
- `src/app/(customer)`: paginas del cliente autenticado.
- `src/app/dashboard`: dashboard del dueño.
- `src/app/api`: endpoints de disponibilidad y reservas.

La logica de dominio vive bajo `src/features`:

- `src/features/availability`: calculo de slots disponibles.
- `src/features/bookings`: reglas, queries, acciones y servicio transaccional de reservas.
- `src/features/businesses`: queries y acciones de negocios.
- `src/features/auth`: acciones, formularios y helpers de autenticacion.
- `src/features/resources`: recursos reservables.
- `src/features/services`: servicios del negocio.

Prisma esta configurado en:

- `prisma/schema.prisma`: modelos y enums.
- `prisma/migrations`: migraciones.
- `prisma/seed.ts`: datos demo.
- `src/lib/prisma.ts`: cliente Prisma con adapter PostgreSQL.
- `src/generated/prisma`: cliente generado. No editar manualmente.

## Reglas De Reserva

- Solo negocios `ACTIVE` aceptan disponibilidad publica y reservas.
- Un recurso debe estar asociado al servicio mediante `ResourceService` para poder reservarse.
- Las reglas de disponibilidad guardan minutos locales del dia.
- `BlockedTime` y `Booking.startsAt/endsAt` se guardan como `DateTime` UTC.
- La zona horaria del negocio define la interpretacion local de horarios.
- Solo reservas `PENDING` y `CONFIRMED` bloquean disponibilidad.
- La creacion de reservas revalida disponibilidad dentro de una transaccion Prisma.

## Notas De Desarrollo

- Usar npm. El repo incluye `package-lock.json`.
- No importar `@/lib/prisma` ni `@/lib/env` en Client Components.
- Prisma Client se importa desde `@/generated/prisma/client`.
- Los valores `Decimal` de Prisma deben convertirse a string antes de pasarlos a Client Components.
- Los tests actuales son unitarios y no requieren base de datos activa.

## Troubleshooting

Si `npm run db:up` falla, revisar que Docker Desktop este abierto.

Si `npm run build` falla con `ECONNREFUSED`, levantar Postgres con:

```bash
npm run db:up
```

Si Prisma no encuentra `DATABASE_URL`, confirmar que existe `.env` en la raiz del proyecto.
