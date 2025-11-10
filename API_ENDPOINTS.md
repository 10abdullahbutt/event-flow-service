# Event Flow Service - API Endpoints & Test Data

## Base URL
```
http://localhost:3000
```

## Swagger Documentation
```
http://localhost:3000/api
```

---

## 1. Health Check

### GET /health
Check service health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

## 2. Events (Producer)

### POST /events
Publish a user event to the event bus.

**Request Body:**
```json
{
  "userId": "user123",
  "type": "ORDER_CREATED",
  "payload": {
    "orderId": "order123",
    "amount": 99.99,
    "currency": "USD",
    "items": [
      {
        "productId": "prod1",
        "quantity": 2,
        "price": 49.99
      }
    ]
  }
}
```

**Response (202 Accepted):**
```json
{
  "status": "accepted",
  "eventId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Note:** `eventId` and `createdAt` are optional and will be auto-generated if not provided.

---

## 3. Notifications

### GET /notifications
Get all notifications with optional filters.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status (`pending`, `sent`, `failed`)
- `limit` (optional): Limit results (default: 50)

**Example:**
```
GET /notifications?userId=user123&status=sent&limit=10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "eventId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user123",
    "type": "ORDER_CREATED",
    "payload": {
      "orderId": "order123",
      "amount": 99.99
    },
    "status": "sent",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /notifications/:id
Get notification by ID.

**Example:**
```
GET /notifications/123e4567-e89b-12d3-a456-426614174000
```

### GET /notifications/user/:userId
Get all notifications for a specific user.

**Example:**
```
GET /notifications/user/user123
```

---

## 4. Audit Logs

### GET /audit
Get all audit logs with optional filters.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `type` (optional): Filter by event type
- `limit` (optional): Limit results (default: 100)

**Example:**
```
GET /audit?userId=user123&type=ORDER_CREATED&limit=20
```

**Response:**
```json
[
  {
    "id": "uuid",
    "eventId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user123",
    "type": "ORDER_CREATED",
    "payload": {
      "orderId": "order123",
      "amount": 99.99
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "ingestedAt": "2024-01-01T00:00:01.000Z"
  }
]
```

### GET /audit/:id
Get audit log by ID.

**Example:**
```
GET /audit/123e4567-e89b-12d3-a456-426614174000
```

### GET /audit/user/:userId
Get all audit logs for a specific user.

**Example:**
```
GET /audit/user/user123
```

---

## Test Data Examples

### Example 1: Order Created Event
```json
{
  "userId": "user123",
  "type": "ORDER_CREATED",
  "payload": {
    "orderId": "order-12345",
    "amount": 199.99,
    "currency": "USD",
    "items": [
      {
        "productId": "prod-001",
        "name": "Product Name",
        "quantity": 2,
        "price": 99.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    }
  }
}
```

### Example 2: Login Event
```json
{
  "userId": "user456",
  "type": "LOGIN",
  "payload": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Example 3: Profile Updated Event
```json
{
  "userId": "user789",
  "type": "PROFILE_UPDATED",
  "payload": {
    "changes": {
      "email": "newemail@example.com",
      "name": "John Doe"
    },
    "updatedFields": ["email", "name"]
  }
}
```

### Example 4: Purchase Event
```json
{
  "userId": "user123",
  "type": "PURCHASE",
  "payload": {
    "transactionId": "txn-789",
    "amount": 49.99,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "productId": "prod-002"
  }
}
```

### Example 5: Webhook Event
```json
{
  "userId": "user123",
  "type": "WEBHOOK",
  "payload": {
    "source": "external_service",
    "event": "payment_completed",
    "data": {
      "paymentId": "pay-123",
      "status": "completed"
    }
  }
}
```

---

## cURL Examples

### Publish an Event
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

### Get Notifications
```bash
curl http://localhost:3000/notifications?userId=user123&status=sent
```

### Get Audit Logs
```bash
curl http://localhost:3000/audit?userId=user123&type=ORDER_CREATED
```

### Health Check
```bash
curl http://localhost:3000/health
```

---

## WebSocket Connection (Real-time Notifications)

Connect to WebSocket endpoint and join a room by userId:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Join room for user notifications
socket.emit('join', 'user123');

// Listen for notifications
socket.on('notification', (data) => {
  console.log('Received notification:', data);
  // {
  //   eventId: "...",
  //   type: "ORDER_CREATED",
  //   payload: {...},
  //   createdAt: "..."
  // }
});
```

---

## Notes

1. **Event Processing Flow:**
   - Event is published via POST /events
   - Event is processed by both Audit Service and Notification Service
   - Audit Service persists to database
   - Notification Service checks deduplication, rate limiting, then sends via WebSocket

2. **Rate Limiting:**
   - Max 5 notifications per 60 seconds per user
   - Exceeding limit marks notification as "failed"

3. **Deduplication:**
   - Events with same eventId are deduplicated using Redis
   - Duplicate events are ignored

4. **Idempotency:**
   - Both audit logs and notifications use unique constraint on eventId
   - Duplicate events are gracefully ignored

