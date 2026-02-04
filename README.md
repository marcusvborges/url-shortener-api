# URL Shortener API

REST API for URL shortening, developed as a technical challenge.  
Built with **Node.js (NestJS)**, **TypeORM**, **PostgreSQL**, **Docker** and **pnpm**.


## Tech Stack

- Node.js 20 (LTS)
- NestJS
- TypeORM
- PostgreSQL
- Docker & Docker Compose
- pnpm
- JWT Authentication
- Zod (environment validation)


## Requirements

- Node.js 20.x
- pnpm >= 10
- Docker + Docker Compose

## Quick start

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

3. **Initialize the dependencies with Docker**
```bash
docker compose up -d
```

4. **Execute the database migrations**
```bash
pnpm run migration:run
```

5. **Start the development server**
```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`

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

JWT_SECRET=change_me
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
pnpm run test   # Run tests
```

## API status

The project is under active development.

## Planned Releases

- `v0.1.0` – Public URL shortening + redirect with click counting
- `v0.2.0` – Users and authentication (JWT)
- `v0.3.0` – URL ownership (authenticated vs anonymous)
- `v0.4.0` – User operations (list, update, delete URLs)
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