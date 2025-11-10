# Quick Start Guide

## Prerequisites

- Node.js (v18+)
- PostgreSQL (for audit logs and notifications)
- Redis (optional, for deduplication and rate limiting)

## Installation

```bash
yarn install
```

## Environment Variables

Create a `.env` file (optional, defaults are provided):

```env
PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=audit_db
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Start Services

### 1. Start PostgreSQL
```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=audit_db \
  -p 5432:5432 \
  postgres:15

# Or use your local PostgreSQL
```

### 2. Start Redis (Optional)
```bash
# Using Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Or use your local Redis
```

### 3. Start the Application
```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

## Verify Installation

1. **Check Health:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Access Swagger UI:**
   Open browser: http://localhost:3000/api

3. **Test Event Publishing:**
   ```bash
   curl -X POST http://localhost:3000/events \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user123",
       "type": "ORDER_CREATED",
       "payload": {
         "orderId": "order123",
         "amount": 99.99
       }
     }'
   ```

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check connection credentials in `.env` or use defaults
- Database will be auto-created if it doesn't exist (with synchronize: true)

### Redis Connection Error
- Redis is optional - the service will continue without it
- Deduplication and rate limiting won't work without Redis
- Check Redis connection in health endpoint

### Port Already in Use
- Change PORT in `.env` or use: `PORT=3001 yarn start:dev`

