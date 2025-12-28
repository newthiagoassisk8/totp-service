import './dotenv-loader.js';

import { createServer } from 'node:http';

import {
    createApp,
    defineEventHandler,
    toNodeListener,
} from 'h3';

import createToken from './handlers/auth/create-token.js';
import login from './handlers/auth/login.js';
import register from './handlers/auth/register.js';
import revokeToken from './handlers/auth/revoke-token.js';
import userInfo from './handlers/auth/user-info.js';
import globalErrorHandler from './handlers/core/globalErrorHandler.js';
import exportTotps from './handlers/management/export.js';
import importTotps from './handlers/management/import.js';
import manageTotp from './handlers/management/totp.js';
import genPublicTotpCode from './handlers/totp/gen-public-totp-code.js';
import listTotp from './handlers/totp/list-codes.js';
import { rateLimit } from './middleware/rate-limit.js';

const app = createApp();

/**
 * CORS
 */
const allowedOrigins = String(process.env.CORS_ALLOWED_ORIGINS || '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

function isAllowedVercelSubdomain(origin: string) {
    try {
        const url = new URL(origin);
        return url.hostname.endsWith('.vercel.app');
    } catch {
        return false;
    }
}

function getCorsOrigin(requestOrigin?: string) {
    if (allowedOrigins.includes('*')) return '*';
    if (!requestOrigin) return '';
    if (isAllowedVercelSubdomain(requestOrigin)) return requestOrigin;
    return allowedOrigins.includes(requestOrigin) ? requestOrigin : '';
}

app.use(globalErrorHandler);

/**
 * Global CORS middleware
 */
app.use(
    defineEventHandler((event) => {
        const origin = typeof event.node.req.headers.origin === 'string' ? event.node.req.headers.origin : undefined;

        const corsOrigin = getCorsOrigin(origin);

        if (corsOrigin) {
            event.node.res.setHeader('Access-Control-Allow-Origin', corsOrigin);
            event.node.res.setHeader('Vary', 'Origin');
        }

        event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        event.node.res.setHeader('Access-Control-Max-Age', '86400');

        if (event.node.req.method === 'OPTIONS') {
            event.node.res.statusCode = 200;
            return '';
        }
    })
);

/**
 * Rate limiting
 */
app.use(defineEventHandler(rateLimit(120)));

/**
 * Routes
 */

// Auth routes (public)
app.use('/api/auth/register', register);
app.use('/api/auth/login', login);
app.use('/api/auth/token', createToken);
app.use('/api/auth/revoke', revokeToken);
app.use('/api/auth/user', userInfo);

// TOTP routes (protected)
app.use('/api/totp', listTotp);

// TOTP public routes (public not auth required)
app.use('/api/public/generate-totp-code', genPublicTotpCode);

// Management routes (protected)
app.use('/api/management/totp', manageTotp);
app.use('/api/management/export', exportTotps);
app.use('/api/management/import', importTotps);

/**
 * Server
 */
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST ?? '0.0.0.0';

createServer(toNodeListener(app)).listen(port, host, () => {
    console.log(`🚀 TOTP service listening on http://${host}:${port}`);
    console.log('');
    console.log('📋 Available routes:');
    console.log('  POST   /api/auth/register      - Register new user');
    console.log('  POST   /api/auth/login         - User login');
    console.log('  POST   /api/auth/token         - Create auth token');
    console.log('  POST   /api/auth/revoke        - Revoke auth token');
    console.log('  GET    /api/auth/user          - Get user info (protected)');
    console.log('  GET    /api/totp               - List TOTP codes (protected)');
    console.log('  POST   /api/management/totp    - Create TOTP (protected)');
    console.log('  PUT    /api/management/totp    - Update TOTP (protected)');
    console.log('  PATCH  /api/management/totp    - Update TOTP (protected)');
    console.log('  DELETE /api/management/totp    - Delete TOTP (protected)');
    console.log('  GET    /api/management/export  - Export TOTPs (protected)');
    console.log('  POST   /api/management/import  - Import TOTPs (protected)');
    console.log('  POST   /api/public/generate-totp-code  - Public route to generate TOTP codes (auth is not required)');
});
