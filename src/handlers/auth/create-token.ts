import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';

import { db } from '@/db/client.js';
import { users } from '@/db/schema.js';
import { createAuthToken } from '@/services/auth.service.js';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    let tokenDaysExpires = Number(body?.days) || undefined;
    let showUser = Boolean(body?.showUser ?? false) || false;

    if (!body?.email || !body?.password) {
        event.node.res.statusCode = 400;
        return { error: 'email and password are required' };
    }

    const [user] = await db.select().from(users).where(eq(users.email, body.email));

    if (!user) {
        event.node.res.statusCode = 401;
        return { error: 'invalid credentials' };
    }

    const bcryptjs = await import('bcryptjs');
    const valid = await bcryptjs.compare(body.password, user.password);

    if (!valid) {
        event.node.res.statusCode = 401;
        return { error: 'invalid credentials' };
    }

    if (!user?.id) {
        event.node.res.statusCode = 400;
        return { error: 'Invalid credentials' };
    }

    const { token, expiresAt, createdAt } = await createAuthToken(user.id, tokenDaysExpires || null);

    const reponseData: any = {
        token,
        expiresAt,
        createdAt,
    };

    if (showUser) {
        reponseData['user'] = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }

    return reponseData;
});
