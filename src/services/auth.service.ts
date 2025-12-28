import { randomUUID } from 'node:crypto';

import { addDays } from 'date-fns';
import { and, desc, eq, ne, notInArray } from 'drizzle-orm';

import { db } from '@/db/client.js';
import { authTokens } from '@/db/schema.js';

export async function createAuthToken(userId: string, days: number | null = null) {
    const token = randomUUID();
    days = days || Number(days) || 365;

    if (!days || days <= 0) {
        days = 1;
    }

    const createdAt = new Date();

    const expiresAt = addDays(createdAt, days) || null;

    await db.insert(authTokens).values({
        userId,
        token,
        expiresAt,
    });

    /**
     * Find IDs to keep (3 most recent)
     */
    const rowsToKeep = await db
        .select({ id: authTokens.id })
        .from(authTokens)
        .where(and(eq(authTokens.userId, userId)))
        .orderBy(desc(authTokens.createdAt))
        .limit(3);

    /**
     * Delete older tokens (except keep = true)
     */
    await db.delete(authTokens).where(
        and(
            eq(authTokens.userId, userId),
            eq(authTokens.keep, false),
            ne(authTokens.token, token),
            rowsToKeep.length > 0
                ? notInArray(
                      authTokens.id,
                      rowsToKeep.map((r) => r.id)
                  )
                : undefined
        )
    );

    return { token, expiresAt, createdAt };
}

export async function revokeToken(token: string) {
    await db.delete(authTokens).where(eq(authTokens.token, token));
}
