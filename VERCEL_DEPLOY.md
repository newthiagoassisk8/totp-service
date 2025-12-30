# Vercel Deployment Guide

## Prerequisites

1. PostgreSQL database (e.g., Neon, Supabase, Railway)
2. Vercel account
3. Vercel CLI installed: `npm i -g vercel`

## Environment Variables

Configure these in Vercel Dashboard (Settings → Environment Variables):

```env
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ALLOWED_ORIGINS=*
PORT=3001
NODE_ENV=production
```

## Deployment Steps

### 1. First-time setup

```bash
# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 3. Run migrations

After first deployment, run migrations:

```bash
# Set DATABASE_URL in your local .env or export it
vercel env pull .env.local

# Run migrations locally pointing to production DB
npm run db:migrate

# Or connect to your production DB directly
```

## Alternative: Deploy via Vercel Dashboard

1. Import your Git repository in Vercel Dashboard
2. Configure environment variables
3. Deploy

## Database Migration Strategy

**Option 1: Pre-deployment migrations**
- Run migrations manually before deploying
- Connect to production database locally
- Execute: `npm run db:migrate`

**Option 2: Migration script**
- Create a separate script that runs migrations
- Deploy it as a separate Vercel function
- Call it manually after deployment

**Option 3: Automatic migrations (Not recommended for production)**
- Add migrations to `vercel-build` script
- Migrations run on every deploy
- Risk: Multiple instances running migrations simultaneously

## Vercel Configuration

The `vercel.json` file configures:
- **Rewrites**: All requests → `/api` (serverless function)
- **Function settings**:
  - Entry: `api/index.ts`
  - Memory: 1024 MB
  - Max duration: 10 seconds (Hobby plan limit)

**Note**: Vercel automatically detects TypeScript files in the `api/` directory and builds them as serverless functions.

## Testing Deployment

```bash
# Test endpoint
curl https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

## Build Process

- **Local development**: Uses `tsx watch` for hot reload
- **Production build**: Vite bundles TypeScript to optimized JavaScript
- **Vercel**: Uses `api/index.ts` as serverless function entry point

## Troubleshooting

### Error: "Module not found"
- Check `external` array in `vite.config.ts`
- Ensure all dependencies are in `package.json`

### Database connection issues
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check database allows connections from Vercel IPs
- Enable SSL if required by your database provider

### CORS errors
- Configure `CORS_ALLOWED_ORIGINS` in Vercel environment variables
- Ensure your frontend domain is included

### Function timeout
- Default: 10 seconds (Hobby plan)
- Increase in `vercel.json` if on Pro plan
- Optimize slow database queries

## Monitoring

- View logs: `vercel logs`
- Real-time logs: `vercel logs --follow`
- Dashboard: https://vercel.com/dashboard

## Useful Commands

```bash
# Pull environment variables
vercel env pull

# View deployment logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Promote deployment to production
vercel promote [deployment-url]

# Remove deployment
vercel rm [deployment-url]
```
