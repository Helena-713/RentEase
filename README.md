# RentEase API

Property rental platform REST API built with Express.js and Sequelize. Landlords list and manage properties, tenants apply for rentals, admins moderate listings and verifications, and both parties can leave reviews after a completed rental.

## Tech Stack

- **Express.js** — HTTP server
- **Sequelize** — ORM
- **PostgreSQL** — database
- **JWT** — authentication
- **bcrypt** — password hashing
- **Multer** — file uploads (profile images, verification documents, property images)
- **Pino** — structured logging
- **Zod** — request validation and OpenAPI schema generation
- **Swagger UI** — interactive API docs (development only)

## Project Structure

```
src/
├── app.js              # Express app setup
├── server.js           # Entry point
├── config/             # Database, logger, Sequelize, upload, Swagger
├── constants/          # Enums (roles, statuses, etc.)
├── controllers/        # Request/response handlers
├── docs/               # OpenAPI registry and path definitions
├── middleware/         # Auth, validation, error handler, uploads
├── models/             # Sequelize models
├── routes/             # Route definitions
├── schemas/            # Zod schemas (validation + OpenAPI)
├── services/           # Business logic
└── utils/              # AppError, asyncHandler, pagination
migrations/             # Sequelize migrations
seeders/                # Sequelize seeders
```

## Prerequisites

- Node.js 18+
- PostgreSQL

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:

   | Variable | Description |
   |----------|-------------|
   | `PORT` | Server port (default `3000`) |
   | `NODE_ENV` | `development` or `production` |
   | `LOG_LEVEL` | Pino log level |
   | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
   | `JWT_SECRET` | Secret for signing tokens |
   | `JWT_EXPIRES_IN` | Token expiry (e.g. `24h`) |

3. **Create the database**

   ```bash
   createdb rentease_dev
   ```

4. **Run migrations**

   ```bash
   npm run db:migrate
   ```

   This creates all tables and seeds a default admin user:

   - Email: `admin@rentease.com`
   - Password: `admin_password`

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:3000`.

## Database Overview

| Table | Purpose |
|-------|---------|
| `users` | Accounts with role `TENANT`, `LAND_LORD`, or `ADMIN` |
| `landlord_verifications` | Landlord identity verification (one per landlord) |
| `properties` | Rental listings with approval and status workflow |
| `property_images` | Property photos (one cover image per property) |
| `amenities` | Amenity catalog (admin-managed) |
| `property_amenities` | Many-to-many property ↔ amenity links |
| `applications` | Tenant applications for properties |
| `reviews` | Post-rental reviews between tenant and landlord |

## Key Business Flows

**Landlord onboarding**

1. Register with role `LAND_LORD`
2. Submit landlord verification document (`PATCH /api/users/me/landlord-verification`)
3. Admin approves verification
4. Create properties (requires verified landlord)
5. Admin approves property listing

**Rental cycle**

1. Tenant applies for an approved, `AVAILABLE` property
2. Landlord approves application → property becomes `RESERVED`; other pending applications are auto-rejected
3. Landlord marks property as rented → `RENTED`
4. Landlord marks property as available → `AVAILABLE`; application becomes `COMPLETED`
5. Tenant and landlord can leave reviews for that completed rental

**Reviews**

- Tenant reviews landlord: `targetType: LANDLORD`
- Landlord reviews tenant: `targetType: TENANT`
- Reviews are only allowed after a rental is completed (step 4 above)
- One review per direction per property per reviewer/reviewee pair

## API Documentation (Swagger)

When `NODE_ENV=development`:

- **Swagger UI:** `http://localhost:3000/api-docs`
- **OpenAPI JSON:** `http://localhost:3000/api-docs.json`

Use the **Authorize** button in Swagger UI with `Bearer <token>` from login. Swagger is not available in production.

## API Endpoints

All routes are prefixed with `/api`. Paginated list endpoints accept `?page=1&limit=10`. Application lists also accept an optional `status` filter.

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Health check |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register (tenant or landlord); optional profile image |
| POST | `/auth/login` | Public | Login and receive JWT |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | JWT | Get current user profile |
| PATCH | `/users/me` | JWT | Update own profile; optional profile image |
| PATCH | `/users/me/landlord-verification` | JWT (landlord) | Submit or update verification document |
| GET | `/users` | Admin | List all users (paginated) |
| PATCH | `/users/:id` | Admin | Update any user |
| GET | `/users/:id/reviews` | Public | List reviews received by a user (paginated) |

### Landlord Verifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/landlord-verifications/pending` | Admin | List pending verifications (paginated) |
| PATCH | `/landlord-verifications/:id/review` | Admin | Approve or reject verification |

### Properties

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/properties` | Public | List approved properties (paginated) |
| GET | `/properties/public/:id` | Public | Get approved property by id |
| GET | `/properties/mine` | Landlord | List own properties (paginated) |
| GET | `/properties/:id` | Landlord | Get own property by id |
| POST | `/properties` | Verified landlord | Create property with images |
| PATCH | `/properties/:id` | Landlord | Update property; optional new images |
| DELETE | `/properties/:id/images/:imageId` | Landlord | Delete a property image |
| PUT | `/properties/:id/amenities` | Landlord or admin | Set property amenities |
| PATCH | `/properties/:id/available` | Landlord | Mark rented property available and complete rental |
| GET | `/properties/pending` | Admin | List unapproved properties (paginated) |
| PATCH | `/properties/:id/review` | Admin | Approve or reject property |

### Amenities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/amenities` | Public | List amenities (paginated) |
| GET | `/amenities/:id` | Public | Get amenity by id |
| POST | `/amenities` | Admin | Create amenity |

### Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/applications` | Tenant | Apply for a property |
| GET | `/applications/mine` | Tenant | List own applications (paginated) |
| GET | `/applications/mine/:id` | Tenant | Get own application by id |
| PATCH | `/applications/:id/withdraw` | Tenant | Withdraw pending application |
| GET | `/applications/landlord` | Landlord | List applications on own properties (paginated) |
| GET | `/applications/landlord/:id` | Landlord | Get application by id |
| PATCH | `/applications/:id/approve` | Landlord | Approve application; reserve property |
| PATCH | `/applications/:id/reject` | Landlord | Reject application |
| PATCH | `/applications/:id/rent` | Landlord | Mark property as rented |
| GET | `/applications` | Admin | List all applications (paginated) |
| GET | `/applications/:id` | Admin | Get application by id |
| PATCH | `/applications/:id/cancel` | Admin | Cancel application |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | Tenant or landlord | Create review after completed rental |
| GET | `/reviews/mine` | JWT | List reviews I wrote (paginated) |
| GET | `/reviews/received` | JWT | List reviews about me (paginated) |
| GET | `/reviews` | Admin | List all reviews (paginated) |
| GET | `/reviews/:id` | Admin | Get review by id |

## Example Requests

**Health check**

```bash
curl http://localhost:3000/api/health
```

**Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentease.com","password":"admin_password"}'
```

**Authenticated request**

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>"
```

## Request & Response Conventions

**Authentication:** send `Authorization: Bearer <token>` on protected routes.

**Success (single resource):**

```json
{
  "success": true,
  "data": {}
}
```

**Success (paginated list):**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Human-readable summary",
  "errors": []
}
```

## Adding Endpoints with Zod + Swagger

For each new resource:

1. **Define schemas** in `src/schemas/<resource>.schema.js`:

   ```js
   const { z } = require('./zod');

   const createUserSchema = z.object({
     body: z.object({
       name: z.string(),
       email: z.string().email(),
     }),
   });
   ```

2. **Register the path** in `src/docs/paths/<resource>.path.js` using the same schemas, then import it in `src/docs/index.js`.

3. **Validate requests** in routes:

   ```js
   const validate = require('../middleware/validate');
   router.post('/', validate(createUserSchema), asyncHandler(controller.create));
   ```

Changing a Zod schema updates both validation and Swagger docs.

## Adding Tables & Migrations

1. Add Sequelize models under `src/models/`
2. Create a migration in `migrations/`:

   ```bash
   npx sequelize-cli migration:generate --name create-your-table
   ```

3. Run migrations:

   ```bash
   npm run db:migrate
   ```

## Scripts

| Script                    | Description              |
|---------------------------|--------------------------|
| `npm run dev`             | Start with nodemon       |
| `npm start`               | Start production server  |
| `npm run db:migrate`      | Run migrations           |
| `npm run db:migrate:undo` | Undo last migration      |
| `npm run db:seed`         | Run seeders              |
