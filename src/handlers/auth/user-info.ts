import { defineEventHandler } from 'h3';
import { getUserIdFromRequest } from '@/auth/token.js';
import { db } from '@/db/client.js';
import { users } from '@/db/schema.js';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const userId = await getUserIdFromRequest(event);
    if (!userId) {
        event.node.res.statusCode = 401;
        return { error: 'unauthorized' };
    }

    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId));

    if (!user) {
        event.node.res.statusCode = 404;
        return { error: 'user not found' };
    }

    return user;
});
