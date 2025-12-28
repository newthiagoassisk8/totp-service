# API Documentation - TOTP Service

## Summary

This service manages TOTP (Time-based One-Time Password) codes per user, with Bearer token authentication.

## Authentication

All protected routes require a Bearer token in the header:
```
Authorization: Bearer <token>
```

Or via query string (less secure):
```
?token=<token>
```

---

## Public Routes

### 1. User Registration
**POST** `/api/auth/register`

Registers a new user in the system.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

**Errors:**
- 400: `name, email and password are required`
- 409: `email already exists`

---

### 2. Login
**POST** `/api/auth/login`

Authenticates a user and returns their information.

**Request Body:**
```json
{
  "email": "demo@email.com",
  "password": "pass123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Admin",
  "email": "admin@example.com"
}
```

**Errors:**
- 400: `email and password are required`
- 401: `invalid credentials`

---

### 3. Create Authentication Token
**POST** `/api/auth/token`

Creates an authentication token for a user. Use the `id` returned from login.

**Request Body:**
```json
{
  "userId": "uuid-do-usuario",
  "days": 30  // optional, default 30 days
}
```

**Response (200):**
```json
{
  "token": "uuid-token",
  "expiresAt": "2025-01-25T04:12:31.878Z"
}
```

**Errors:**
- 400: `userId is required`

---

### 4. Revoke Token
**POST** `/api/auth/revoke`

Revokes (deletes) an authentication token.

**Request Body:**
```json
{
  "token": "uuid-token"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- 400: `token is required`

---

## Protected Routes

### 4. User Information
**GET** `/api/auth/user`

Returns information about the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Admin",
  "email": "admin@example.com"
}
```

**Errors:**
- 401: `unauthorized`
- 404: `user not found`

---

### 5. List TOTP Codes
**GET** `/api/totp`

Lists all TOTP codes of the authenticated user with generated codes.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "label": "Demo TOTP",
    "otp": "123456",
    "expires": 1735186351878,
    "expiresDate": "2025-12-26T04:12:31.878Z",
    "digits": 6
  }
]
```

**Response without token:** `[]`

---

## Management Routes (Protected)

### 6. Create TOTP
**POST** `/api/management/totp`

Creates a new TOTP for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "label": "GitHub",
  "secret": "JBSWY3DPEHPK3PXP",
  "digits": 6,        // optional, default 6
  "period": 30,       // optional, default 30
  "algorithm": "SHA-1", // optional
  "icon": "github.png", // optional
  "metadata": {},     // optional
  "sort": 1           // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "label": "GitHub",
    "secret": "JBSWY3DPEHPK3PXP",
    "digits": 6,
    "period": 30,
    "algorithm": "SHA-1",
    "icon": "github.png",
    "metadata": {},
    "sort": 1
  }
}
```

**Errors:**
- 401: `unauthorized`
- 400: `label and secret are required`

---

### 7. Update TOTP
**PUT** or **PATCH** `/api/management/totp`

Updates an existing TOTP of the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "id": "uuid-do-totp",
  "label": "GitHub Updated",  // optional fields
  "secret": "NEW_SECRET",
  "digits": 8,
  "period": 60,
  "algorithm": "SHA-256",
  "icon": "new-icon.png",
  "metadata": {"updated": true},
  "sort": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    // Updated TOTP
  }
}
```

**Errors:**
- 401: `unauthorized`
- 400: `id is required`
- 404: `TOTP not found or access denied`

---

### 8. Delete TOTP
**DELETE** `/api/management/totp`

Deletes a TOTP from the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "id": "uuid-do-totp"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    // Deleted TOTP
  }
}
```

**Errors:**
- 401: `unauthorized`
- 400: `id is required`
- 404: `TOTP not found or access denied`

---

### 9. Export TOTPs
**GET** `/api/management/export`

Exports all TOTPs of the authenticated user in JSON format.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "version": "1.0",
  "exportedAt": "2025-12-26T04:28:21.455Z",
  "count": 2,
  "totps": [
    {
      "id": "uuid",
      "label": "GitHub",
      "secret": "JBSWY3DPEHPK3PXP",
      "digits": 6,
      "period": 30,
      "algorithm": "SHA-1",
      "icon": "github.png",
      "metadata": {},
      "sort": 1
    }
  ]
}
```

**Response headers:**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="totps-export.json"`

**Errors:**
- 401: `unauthorized`

---

### 10. Import TOTPs
**POST** `/api/management/import`

Imports TOTPs in bulk for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "totps": [
    {
      "label": "GitHub",
      "secret": "JBSWY3DPEHPK3PXP",
      "digits": 6,
      "period": 30,
      "algorithm": "SHA-1",
      "icon": "github.png",
      "metadata": {},
      "sort": 1
    },
    {
      "label": "Google",
      "secret": "ANOTHER_SECRET_KEY",
      "digits": 6,
      "period": 30
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "imported": 2,
  "data": [
    // Array with imported TOTPs
  ]
}
```

**Errors:**
- 401: `unauthorized`
- 400: `totps array is required`
- 400: `each TOTP must have label and secret`

---

## Typical Flow

1. **Registration**: POST `/api/auth/register` with name, email and password
2. **Login**: POST `/api/auth/login` with email/password
3. **Create Token**: POST `/api/auth/token` with received userId
3. **Create Token**: POST `/api/auth/token` with received userId
4. **Use Token**: Include token in all protected requests
5. **Manage TOTPs**: Create/Update/Delete via `/api/management/totp`
6. **List Codes**: GET `/api/totp` to see generated codes
7. **Export**: GET `/api/management/export` for backup
8. **Import**: POST `/api/management/import` to restore

---

## Security

- ✅ Rate limit: 120 requests per minute per IP
- ✅ Tokens with configurable expiration
- ✅ Configurable CORS via `CORS_ALLOWED_ORIGINS`
- ✅ Each user only accesses their own TOTPs
- ✅ Passwords hashed with bcrypt

---

## Initial Seed

Run to create test admin user:

```bash
npm run db:seed
```

**Created user:**
- Email: `demo@email.com`
- Password: `pass123`
- Fixed token: `c8eeaabf3ef14ffc811cab37ba16753f`
- Demo TOTP included

**⚡ The seed is idempotent:**
- First run: creates user, token and TOTP
- Subsequent runs: updates user and TOTP (compares by email/secret)
- Does not duplicate existing tokens or TOTPs
