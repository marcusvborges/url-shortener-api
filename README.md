# URL Shortener API

![Node](https://img.shields.io/badge/node-20-green)
![NestJS](https://img.shields.io/badge/nestjs-backend-red)
![Postgres](https://img.shields.io/badge/postgres-db-blue)
![GitHub release](https://img.shields.io/github/v/release/marcusvborges/url-shortener-api)

A REST API built as a backend technical challenge focused on URL shortening.
Beyond the core functionality, it explores clean architecture principles, scalability considerations, and backend best practices.

Built with **Node.js (NestJS)**, **TypeORM**, **PostgreSQL** and **Docker**. Dependency management powered by **pnpm**.

## Features

### URL Shortening
- Public endpoint for URL shortening
- Base62 short code generation for each URL, creating a shortened link based on the base URL and generated code
- HTTP 302 redirect with click counting
- Automatic retry mechanism (up to 5 attempts) to handle potential short code collisions during concurrent requests

### Ownership & Idempotency
- URLs can be associated with authenticated users
- Ownership enforcement ensuring users can only access and modify their own URLs
- Idempotent URL shortening per user:
  - If the same user shortens a URL that is already associated with their account, the existing short link is returned instead of creating a new one, preventing unnecessary database growth
- Unique constraint prevents duplication even under concurrent requests

### Authentication
- JWT (Bearer token) authentication
- Optional authentication for URL creation:
  - No token: anonymous URL
  - Valid token: URL associated with the authenticated user
  - Invalid token: request rejected with 401 Unauthorized

## Tech Stack

- Node.js 20 (LTS)
- NestJS
- TypeORM
- PostgreSQL
- Docker & Docker Compose
- pnpm
- Passport + JWT Authentication
- Zod (environment validation)


## Requirements

- Node.js 20.x
- pnpm >= 10
- Docker + Docker Compose

## Quick start (Local development)

1. **Clone and install the dependencies**
```bash
git clone https://github.com/marcusvborges/url-shortener-api.git
cd url-shortener-api
pnpm install
```

2. **Define the environment variables**
```bash
cp .env.example .env
```

3. **Start PostgreSQL only**
```bash
docker compose up -d db
```

4. **Execute the database migrations**
```bash
pnpm run migration:run
```

5. **Start API locally**
```bash
pnpm run start:dev
```

## Running with Docker

1. **Define the environment variables if you haven't already**
```bash
cp .env.example .env
```

2. **Start full environment**
```bash
docker compose up --build -d
```

3. **Run migrations inside container**
```bash
docker compose exec api pnpm run migration:run
```

---

The API will be available at `http://localhost:3000`

> Do not run `pnpm start:dev` and `docker compose up` simultaneously.
>
> Both use port 3000.

## Environment Variables

All required environment variables are defined and validated using Zod.

```env
PORT=3000
BASE_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=url_shortener

JWT_SECRET=jwt_secret
JWT_EXPIRES_IN=1d

OBSERVABILITY_ENABLED=true
LOG_LEVEL=info
```

## Available Scripts

```bash

# Development
pnpm run start:dev	   # Run in watch mode
pnpm run start:debug   # Run in debug mode

# Production
pnpm run build	       # Build project
pnpm run start:prod    # Start production server

# Database & Migrations
pnpm run migration:generate  # Generates new migration
pnpm run migration:run       # Executes pending migrations
pnpm run migration:revert    # Revert last migration

# Tests
pnpm run test       # Run tests

# Code Quality
pnpm run lint       # Runs ESLint
pnpm run format     # Format code with Prettier
```

## Endpoints

### Authentication
| Method | Route         | Auth | Description |
|------:|---------------|:----:|-------------|
| POST  | /auth/register | No  | Register user |
| POST  | /auth/login    | No  | Login and get access token |
| GET   | /auth/me       | Yes | Get current authenticated user |

### Short URLs
| Method | Route               | Auth | Description |
|------:|---------------------|:----:|-------------|
| POST  | /api/short-url      | Optional | Shorten a URL (anonymous or owned if authenticated) |
| GET   | /:code              | No  | Redirect (302) and increment click counter |
| GET   | /api/short-url/me   | Yes | List current user's shortened URLs (includes clicks) |
| PATCH | /api/short-url/:id  | Yes | Update original URL (owner only) |
| DELETE| /api/short-url/:id  | Yes | Soft delete URL (owner only) |


## API Status

The project is under active development.

## Planned Releases

- `v0.1.0` – Public URL shortening + redirect with click counting
- `v0.2.0` – Users and authentication (JWT)
- `v0.3.0` – URL ownership (authenticated & anonymous)
- `v0.4.0` – User URL management (list, update, soft delete + ownership enforcement)
- `v0.5.0` – Swagger, validations and error handling
- `v0.6.0` – Unit tests and observability (logs)

## Notes
This project prioritizes:

- clean architecture
- explicit configuration
- strong typing
- predictable local execution

## License

This project is licensed under the MIT License.