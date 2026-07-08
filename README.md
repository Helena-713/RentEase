# RentEase

Property rental platform with a REST API backend and vanilla HTML/CSS/JS frontend portals.

## Project layout

```
RentEase/
├── backend/    # Express.js + Sequelize API
└── frontend/   # Tenant, landlord, and admin portals
```

## Quick start

**API** (from `backend/`):

```bash
cd backend
npm install
cp .env.example .env   # configure PostgreSQL and JWT settings
npm run db:migrate
npm run dev            # http://localhost:3000
```

**Frontend** (from repo root, in a separate terminal):

```bash
npx serve frontend -p 8080   # http://localhost:8080
```

## Documentation

- [Frontend docs](frontend/README.md) — portals, routing, setup
- [Backend API docs](backend/README.md) — setup, endpoints, migrations, Swagger
