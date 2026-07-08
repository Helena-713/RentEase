# RentEase

Property rental platform with a REST API backend and vanilla HTML/CSS/JS frontend portals for tenants, landlords, and admins.

## Tech stack

**Backend (API)**

- Express.js
- Sequelize (ORM)
- PostgreSQL
- JWT authentication + bcrypt password hashing
- Zod validation + OpenAPI generation + Swagger UI
- Multer for file uploads (property images, profile images, verification documents)
- Pino logging

**Frontend (portals)**

- Vanilla HTML/CSS/JS (no build step)
- Axios (via CDN in each portal)
- Hash-based routing (`#/path`)

## Project layout

```
RentEase/
├── backend/    # Express.js + Sequelize API
└── frontend/   # Tenant, landlord, and admin portals
```

## Setup & run

### Prerequisites

- Node.js 18+
- PostgreSQL

### Backend (API)

**API** (from `backend/`):

```bash
cd backend
npm install
cp .env.example .env   # configure PostgreSQL and JWT settings
createdb rentease_dev  # or create DB in your Postgres client
npm run db:migrate
npm run dev            # http://localhost:3000
```

### Frontend (portals)

**Frontend** (from repo root, in a separate terminal):

```bash
npx serve frontend -p 8080   # http://localhost:8080
```

### Environment variables

Backend configuration lives in `backend/.env`. Copy it from `backend/.env.example` and refer to `backend/.env.example` for the full, up-to-date list of required variables:

- `PORT`, `NODE_ENV`, `LOG_LEVEL`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`

### Seeded admin account (dev)

After migrations, a default admin account is created:

- Email: `admin@rentease.com`
- Password: `admin_password`

## Database schema (DDL)

The database schema is defined by Sequelize migrations and models:

- **DDL source of truth**: `backend/migrations/`
- **Model definitions / associations**: `backend/src/models/`

For a table-level overview, see the “Database Overview” section in `backend/README.md`.

## Extra features (beyond course scope)

- Messaging between tenants and landlords (conversations + messages)
- Zod request validation + Swagger/OpenAPI docs generated from Zod schemas
- File uploads (property images, profile images, verification documents)
- Structured logging with Pino
- Database schema managed via Sequelize migrations (`sequelize-cli`, e.g. `npm run db:migrate`)

## More documentation

- [Frontend docs](frontend/README.md) — portals, routing, setup
- [Backend API docs](backend/README.md) — setup, endpoints, migrations, Swagger
