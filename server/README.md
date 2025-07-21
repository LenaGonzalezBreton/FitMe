# FitMe Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="60" alt="Nest Logo" /></a>
  <a href="https://www.prisma.io/" target="blank"><img src="https://avatars.githubusercontent.com/u/17219288?s=200&v=4" width="60" alt="Prisma Logo" /></a>
  <a href="https://www.postgresql.org/" target="blank"><img src="https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg" width="60" alt="PostgreSQL Logo" /></a>
</p>

<p align="center">Backend API for FitMe - A fitness application adapted to menstrual cycle phases and menopause</p>

## Description

Backend API built with **NestJS** following Clean Architecture and Domain-Driven Design principles. Features include user authentication, cycle tracking, exercise recommendations, and personalized fitness programs adapted to hormonal phases.

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh token rotation
- **Architecture**: Clean Architecture + DDD
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Caching**: Redis
- **Containerization**: Docker

## Prerequisites

- Node.js 23+ 
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

## Project Setup

### 1. Environment Configuration

Create a `.env` file in the server directory:

```bash
# Database
DATABASE_URL="postgresql://admin:password@localhost:5432/fitme?schema=public"

# PostgreSQL (for Docker)
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=fitme
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase (optional - for notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@...iam.gserviceaccount.com

# Server
PORT=3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup (Prisma)

```bash
# Build the Prisma schema from modular files
npm run prisma:build

# Generate Prisma client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# Optional: Setup demo data
npm run demo:setup
```

## Development

### Start the Development Server

```bash
# Watch mode with hot reload
npm run start:dev

# Regular start
npm run start

# Production mode
npm run start:prod
```

### Prisma Commands

```bash
# Schema Management
npm run prisma:build           # Build schema from modular files (REQUIRED before other commands)
npm run prisma:generate        # Generate Prisma client
npm run prisma:push           # Push schema changes to database
npm run prisma:studio         # Open Prisma Studio (database GUI)

# Advanced Build Options
npm run prisma:build -- --force --push --seed   # Force rebuild + push + run seeders

# Demo Data
npm run demo:setup            # Setup demo users and cycles
npm run demo:exercises        # Seed exercise database
npm run demo:user            # Seed user-specific data
```

## Database Schema Architecture

The project uses a **modular Prisma schema** system:

```
prisma/
├── base/           # Datasource and generator configuration
├── enums/          # Enum definitions (cycle-enums.prisma, user-enums.prisma, etc.)
├── models/         # Model definitions (user.prisma, cycle.prisma, exercise.prisma, etc.)
└── schema.prisma   # Generated final schema (DO NOT EDIT DIRECTLY)
```

**Important**: Always run `npm run prisma:build` before other Prisma commands to ensure the schema is up-to-date.

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch

# Debug mode
npm run test:debug
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## API Documentation

The API documentation is automatically generated using Swagger/OpenAPI:

```bash
# Generate OpenAPI JSON
npm run docs:generate

# Sync docs with Docusaurus (requires docs folder)
npm run docs:sync

# Clean API docs
npm run docs:clean
```

Once running, visit `http://localhost:3000/api` for the interactive API documentation.

## Architecture

This project follows **Clean Architecture** and **Domain-Driven Design** principles:

```
src/
├── app.module.ts           # Main application module
├── main.ts                # Application entry point
├── core/                  # Core infrastructure
│   ├── prisma.service.ts  # Database client service
│   └── ...
├── config/               # Configuration files
│   ├── postgres.config.ts
│   ├── redis.config.ts
│   └── firebase-config.ts
└── modules/              # Domain modules
    ├── auth/             # Authentication domain
    │   ├── domain/       # Entities & repository interfaces
    │   ├── application/  # Use cases & business logic
    │   ├── infrastructure/ # Repository implementations
    │   ├── controller/   # HTTP controllers & DTOs
    │   └── auth.module.ts
    ├── status/           # Health check module
    └── ...
```

## Key Features

- **JWT Authentication** with refresh token rotation
- **Menstrual Cycle Tracking** with phase calculations
- **Exercise Recommendations** adapted to cycle phases
- **Personalized Programs** based on user profile
- **Push Notifications** via Firebase Cloud Messaging
- **Modular Database Schema** with automated build system
- **Clean Architecture** with proper separation of concerns
- **Health Checks** and monitoring endpoints

## Docker Development

Use the parent directory's `docker-compose.yml` for full-stack development:

```bash
# From project root
docker-compose up --build  # First time or after changes
docker-compose up          # Regular development
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 3000

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `POSTGRES_HOST` | PostgreSQL host | localhost |
| `POSTGRES_USER` | PostgreSQL username | admin |
| `POSTGRES_PASSWORD` | PostgreSQL password | password |
| `POSTGRES_DB` | PostgreSQL database name | fitme |
| `POSTGRES_PORT` | PostgreSQL port | 5432 |
| `REDIS_HOST` | Redis server host | localhost |
| `REDIS_PORT` | Redis server port | 6379 |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | 15m |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 7d |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

## Troubleshooting

### Prisma Issues
```bash
# Schema not up to date
npm run prisma:build && npm run prisma:generate

# Database connection issues
docker-compose up postgres redis

# Reset database
npm run prisma:build -- --force --push

# Generate client after schema changes
npm run prisma:generate
```

### Common Errors
- **"Schema not found"**: Run `npm run prisma:build` first
- **"Client not generated"**: Run `npm run prisma:generate`
- **"Database connection failed"**: Ensure PostgreSQL is running via Docker
- **"Redis connection failed"**: Ensure Redis is running via Docker
- **"Build schema failed"**: Check that modular files in `prisma/{base,enums,models}/` are valid

### Development Workflow
1. Make changes to modular schema files in `prisma/{base,enums,models}/`
2. Run `npm run prisma:build` to generate the final schema
3. Run `npm run prisma:push` to update the database
4. Use `npm run prisma:studio` to inspect your data

## Scripts Reference

### Prisma Scripts
```bash
npm run prisma:build          # Build modular schema into single file
npm run prisma:generate       # Generate Prisma client
npm run prisma:push          # Push schema to database
npm run prisma:studio        # Open database GUI
```

### Demo Data Scripts
```bash
npm run demo:setup           # Setup initial demo data
npm run demo:exercises       # Seed exercise database
npm run demo:user           # Seed user-specific data
```

### Documentation Scripts
```bash
npm run docs:generate        # Generate OpenAPI documentation
npm run docs:sync           # Sync API docs with Docusaurus
npm run docs:clean          # Clean generated API docs
```

## Contributing

1. Follow the Clean Architecture principles
2. Keep domain logic framework-independent
3. Use dependency injection for all repositories
4. Write unit tests for use cases
5. Update Prisma schema in modular files (`prisma/{base,enums,models}/`), not the main `schema.prisma`
6. Always run `npm run prisma:build` after schema changes
7. Use conventional commit messages

## License

This project is licensed under the MIT License.