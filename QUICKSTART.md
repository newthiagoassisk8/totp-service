# Quick Start - TOTP Service

## 🚀 How to Use

### Initial Setup:
```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```


## 🚀 Start the Service

### 1. Apply migrations
```bash
npm run db:migrate
```

### 2. Create admin user (first time)
```bash
npm run db:seed
```

Created credentials:
- **Email**: demo@email.com
- **Password**: pass123
- **Fixed token**: c8eeaabf3ef14ffc811cab37ba16753f

**💡 Tip:** The seed is idempotent - can be run multiple times without duplicating data.

### 3. Start server
```bash
npm run dev
```

The server will be available at: http://localhost:3001

---

## 🧪 Test API

### Option 1: Automated script
```bash
./test-api.sh
```

### Option 2: Manual with curl

#### 0. Register new user (optional)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@example.com","password":"senha123"}'
```

#### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@email.com","password":"pass123"}'
```

#### 1b. Or use the fixed seed token
```bash
TOKEN="c8eeaabf3ef14ffc811cab37ba16753f"
```

#### 2. Create token (use the returned ID)
```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId":"SEU_USER_ID"}'
```

#### 3. List TOTPs (use the returned token)
```bash
curl http://localhost:3001/api/totp \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### 4. Create TOTP
```bash
curl -X POST http://localhost:3001/api/management/totp \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Meu App",
    "secret": "JBSWY3DPEHPK3PXP",
    "digits": 6,
    "period": 30
  }'
```

#### 5. Export TOTPs
```bash
curl http://localhost:3001/api/management/export \
  -H "Authorization: Bearer SEU_TOKEN" \
  -o totps-backup.json
```

#### 6. Import TOTPs
```bash
curl -X POST http://localhost:3001/api/management/import \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d @totps-backup.json
```

---

## 📚 Complete Documentation

See `API_DOCS.md` for all routes and examples.

---

## ⚙️ Environment Variables

Create/edit `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server
PORT=3001
HOST=0.0.0.0

# CORS
CORS_ALLOWED_ORIGINS=*
# Or specific: CORS_ALLOWED_ORIGINS=https://app.com,https://admin.app.com
```

---

## 📦 Build for Production

```bash
npm run build
npm run start
```

---

## 🔍 Created Structure

```
src/
├── auth/              # Token validation
├── db/                # Database (schema, client, seed)
├── handlers/          # HTTP routes
│   ├── auth/          # Login, tokens, user info
│   ├── totp/          # Code listing
│   └── management/    # TOTP CRUD
├── middleware/        # Rate limiting
├── services/          # Business logic
└── utils/             # Utilities
```

---

## ✅ Deploy Checklist

- [ ] Configure `DATABASE_URL` in production environment
- [ ] Run `npm run db:migrate`
- [ ] Run `npm run db:seed` (create first user)
- [ ] Configure `CORS_ALLOWED_ORIGINS`
- [ ] Test routes with `./test-api.sh`
- [ ] Configure monitoring/logs
- [ ] Backup database

---

## 🆘 Common Issues

### Database connection error
- Check `DATABASE_URL` in `.env`
- Confirm PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### "unauthorized" when accessing routes
- Create a token with `/api/auth/token`
- Include in header: `Authorization: Bearer SEU_TOKEN`
- Check if token hasn't expired

### Empty TOTP list
- Confirm you're authenticated
- Create TOTPs via `/api/management/totp`
- Each user only sees their own TOTPs
