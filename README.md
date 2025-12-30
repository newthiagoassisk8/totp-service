# TOTP Service

Complete TOTP (Time-based One-Time Password) management service with authentication and per-user isolation.

## 🚀 Features

- ✅ **Complete authentication**: Registration, login, tokens with expiration
- ✅ **TOTP management**: Full CRUD (Create, Read, Update, Delete)
- ✅ **Export/Import**: Backup and restore TOTPs in JSON
- ✅ **Per-user isolation**: Each user manages only their own TOTPs
- ✅ **Security**: Rate limiting (120 req/min), bcrypt, configurable CORS
- ✅ **PostgreSQL**: Persistence with Drizzle ORM and optimized indexes

## 📋 Available Routes

### Authentication (5 routes)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/token` - Create authentication token
- `POST /api/auth/revoke` - Revoke token
- `GET /api/auth/user` - User information (protected)

### TOTP (1 route)
- `GET /api/totp` - List generated TOTP codes (protected)

### Management (5 routes)
- `POST /api/management/totp` - Create TOTP (protected)
- `PUT/PATCH /api/management/totp` - Update TOTP (protected)
- `DELETE /api/management/totp` - Delete TOTP (protected)
- `GET /api/management/export` - Export TOTPs (protected)
- `POST /api/management/import` - Import TOTPs (protected)

**Total: 12 functional routes**

## 🏁 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure .env (copy from .env.example)
cp .env.example .env

# 3. Apply migrations
npm run db:migrate

# 4. Create demo user
npm run db:seed

# 5. Start server
npm run dev
```

The server starts at `http://localhost:3001`

## 🧪 Testing

### Using the fixed seed token:
```bash
curl http://localhost:3001/api/totp \
  -H "Authorization: Bearer c8eeaabf3ef14ffc811cab37ba16753f"
```

### Complete test script:
```bash
./test-api.sh
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Migrations usage guide
- **[API_DOCS.md](API_DOCS.md)** - Complete API documentation
- **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** - Detailed Vercel deployment guide

## 🔑 Default Credentials (Seed)

```
Email: demo@email.com
Password: pass123
Fixed token: c8eeaabf3ef14ffc811cab37ba16753f
```

## 🛠️ Technologies

- **Node.js** + **TypeScript**
- **H3** - Minimalist HTTP framework
- **Drizzle ORM** - Type-safe SQL
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **totp-generator** - TOTP code generation

## 📦 Deploy

### Traditional Server

```bash
npm run build
npm run start
```

Configure environment variables on production server:
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ALLOWED_ORIGINS` - Allowed domains (comma-separated)
- `PORT` - Server port (default: 3001)

### Vercel (Serverless)

This project is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

**See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) for complete deployment guide.**

Key features for Vercel:
- ✅ Serverless function ready (`api/index.ts`)
- ✅ Vite build configuration
- ✅ Optimized for edge deployment
- ✅ CORS and rate limiting included

## 📄 License

MIT
