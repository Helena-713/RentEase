# RentEase API

Express.js + Sequelize (JavaScript) boilerplate with PostgreSQL, MVC architecture, Pino logging, Zod validation, and Swagger API docs.

## Tech Stack

- **Express.js** — HTTP server
- **Sequelize** — ORM
- **PostgreSQL** — database
- **Pino** — structured logging
- **Zod** — request validation and OpenAPI schema generation
- **Swagger UI** — interactive API docs (development only)

## Project Structure

```
src/
├── app.js              # Express app setup
├── server.js           # Entry point
├── config/             # Database, logger, Sequelize, Swagger
├── controllers/        # Request/response handlers
├── docs/               # OpenAPI registry and path definitions
├── middleware/         # Error handler, not-found, validate
├── models/             # Sequelize models
├── routes/             # Route definitions
├── schemas/            # Zod schemas (validation + OpenAPI)
├── services/           # Business logic
└── utils/              # AppError, asyncHandler
migrations/             # Sequelize migrations (add when tables are defined)
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

   Update `.env` with your PostgreSQL credentials.

3. **Create the database**

   ```bash
   createdb rentease_dev
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:3000`.

## API Documentation (Swagger)

When `NODE_ENV=development`:

- **Swagger UI:** `http://localhost:3000/api-docs`
- **OpenAPI JSON:** `http://localhost:3000/api-docs.json`

Swagger is not available in production.

## API Endpoints

| Method | Endpoint      | Description  |
|--------|---------------|--------------|
| GET    | `/api/health` | Health check |

## Example Requests

**Health check**

```bash
curl http://localhost:3000/api/health
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

Migrations are intentionally deferred until the full schema is defined. When ready:

1. Add Sequelize models under `src/models/`
2. Generate migrations:

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

## Error Responses

All errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable summary",
  "errors": []
}
```

In development, a `stack` field is included for debugging.
