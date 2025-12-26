import { createServer } from 'node:http';
import { createApp, defineEventHandler, getQuery, readBody, toNodeListener } from 'h3';
import { TOTP } from 'totp-generator';

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
    const TOTPData = TOTPKeys[uid];
    if (!TOTPData) return null;

    const { otp, expires } = await TOTP.generate(TOTPData.key, TOTPData.opts);
    return {
        uid,
        label: TOTPData.label,
        otp,
        expires,
        now: new Date().getTime(),
        expiresDate: new Date(expires),
        digits: TOTPData.opts.digits,
    };
}

const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

function getCorsOrigin(requestOrigin?: string) {
    if (allowedOrigins.includes('*')) return '*';
    if (!requestOrigin) return '';
    if (isAllowedVercelSubdomain(requestOrigin)) return requestOrigin;
    return allowedOrigins.includes(requestOrigin) ? requestOrigin : '';
}

function isAllowedVercelSubdomain(requestOrigin: string) {
    try {
        const url = new URL(requestOrigin);
        return url.hostname.endsWith('.vercel.app');
    } catch {
        return false;
    }
}

const app = createApp();

app.use(
    defineEventHandler((event: any) => {
        const requestOrigin =
            typeof event.node.req.headers.origin === 'string' ? event.node.req.headers.origin : undefined;
        const corsOrigin = getCorsOrigin(requestOrigin);

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

app.use(
    '/api/totp',
    defineEventHandler(async (event: any) => {
        const requestOrigin =
            typeof event.node.req.headers.origin === 'string' ? event.node.req.headers.origin : undefined;
        const corsOrigin = getCorsOrigin(requestOrigin);

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
                const digitsNumber = Number(bodyDigits);
                if (!Number.isInteger(digitsNumber) || digitsNumber <= 0) {
                    event.node.res.statusCode = 400;
                    return { error: 'digits must be a positive integer' };
                }
                item.opts = { ...item.opts, digits: digitsNumber };
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

        const codes = await Promise.all(Object.keys(TOTPKeys).map((id) => getCode(id)));
        return codes;
    })
);

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';
createServer(toNodeListener(app)).listen(port, host, () => {
    console.log(`TOTP service listening on http://${host}:${port}`);
});
