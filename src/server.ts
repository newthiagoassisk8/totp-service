import './dotenv-loader.js';

import { createServer } from 'node:http';

import { createApp, defineEventHandler, getQuery, readBody, toNodeListener } from 'h3';
import { TOTP } from 'totp-generator';

/**
 * In-memory demo data (temporary)
 */
const TOTPKeys: Record<string, any> = {
    item1: {
        label: 'Demo 1 - 1 digitos',
        icon: null,
        key: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        opts: { digits: 6, period: 30 },
    },
    item2: {
        label: 'Demo 2 - 8 digitos',
        icon: null,
        key: 'JBSWY3DPEHPK3PXP',
        opts: { digits: 6, algorithm: 'SHA-256', period: 30 },
    },
};

async function getCode(uid: string) {
    const data = TOTPKeys[uid];
    if (!data) return null;

    const { otp, expires } = await TOTP.generate(data.key, data.opts);

    return {
        uid,
        label: data.label,
        otp,
        expires,
        now: Date.now(),
        expiresDate: new Date(expires),
        digits: data.opts.digits,
    };
}

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

/**
 * App
 */
const app = createApp();

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

        event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, PUT, OPTIONS');
        event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        event.node.res.setHeader('Access-Control-Max-Age', '86400');

        if (event.node.req.method === 'OPTIONS') {
            event.node.res.statusCode = 200;
            return '';
        }
    })
);

/**
 * /api/totp
 */
app.use(
    '/api/totp',
    defineEventHandler(async (event) => {
        const { uid } = getQuery(event);

        if (event.node.req.method === 'PATCH' || event.node.req.method === 'PUT') {
            const body = await readBody(event);

            const bodyUid = body?.uid;
            const bodyLabel = body?.label;
            const bodyDigits = body?.digits;

            if (!bodyUid || typeof bodyUid !== 'string') {
                event.node.res.statusCode = 400;
                return { error: 'uid is required' };
            }

            const item = TOTPKeys[bodyUid];
            if (!item) {
                event.node.res.statusCode = 404;
                return { error: 'uid not found' };
            }

            let updated = false;

            if (bodyLabel !== undefined) {
                if (typeof bodyLabel !== 'string' || bodyLabel.trim().length === 0) {
                    event.node.res.statusCode = 400;
                    return { error: 'label must be a non-empty string' };
                }

                item.label = bodyLabel;
                updated = true;
            }

            if (bodyDigits !== undefined) {
                const digits = Number(bodyDigits);
                if (!Number.isInteger(digits) || digits <= 0) {
                    event.node.res.statusCode = 400;
                    return { error: 'digits must be a positive integer' };
                }

                item.opts = { ...item.opts, digits };
                updated = true;
            }

            if (!updated) {
                event.node.res.statusCode = 400;
                return { error: 'no updatable fields provided' };
            }

            return getCode(bodyUid);
        }

        if (uid) {
            return getCode(uid as string);
        }

        return Promise.all(Object.keys(TOTPKeys).map((id) => getCode(id)));
    })
);

/**
 * Server
 */
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST ?? '0.0.0.0';

createServer(toNodeListener(app)).listen(port, host, () => {
    console.log(`TOTP service listening on http://${host}:${port}`);
});
