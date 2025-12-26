import 'dotenv/config';

import { eq } from 'drizzle-orm';

import { db } from '@/db/client.js';
import { authTokens } from '@/db/schema.js';

export async function getUserIdFromRequest(event: any): Promise<string | null> {
    const authHeader = event.node.req.headers.authorization;
    const queryToken = new URL(event.node.req.url!, 'http://x').searchParams.get('token');

    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;

    if (!token) return null;

    const [row] = await db.select().from(authTokens).where(eq(authTokens.token, token));

    if (!row) return null;

    if (row.expiresAt && row.expiresAt < new Date()) {
        return null;
    }

    return row.userId;
}
