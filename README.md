# Event Flow Service

Event-driven microservice for real-time notifications and audit logging.

## Tech Stack

- NestJS
- TypeORM
- PostgreSQL
- Redis
- Socket.IO
- Swagger
- Kafka
## Setup

```bash
yarn install
cp .env.example .env
yarn start:dev
```

## Environment Variables

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=audit_db
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
```

## API Documentation

Swagger UI available at `http://localhost:3000/api`

## Scripts

- `yarn start:dev` - Development mode
- `yarn build` - Build for production
- `yarn start:prod` - Production mode
- `yarn migration:run` - Run database migrations
- `yarn test:db` - Test database connection
