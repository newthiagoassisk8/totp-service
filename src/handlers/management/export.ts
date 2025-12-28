import { defineEventHandler } from 'h3';
import { getUserIdFromRequest } from '@/auth/token.js';
import { db } from '@/db/client.js';
import { totps } from '@/db/schema.js';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const userId = await getUserIdFromRequest(event);
    if (!userId) {
        event.node.res.statusCode = 401;
        return { error: 'unauthorized' };
    }

    const rows = await db
        .select({
            id: totps.id,
            label: totps.label,
            secret: totps.secret,
            digits: totps.digits,
            period: totps.period,
            algorithm: totps.algorithm,
            icon: totps.icon,
            metadata: totps.metadata,
            sort: totps.sort,
        })
        .from(totps)
        .where(eq(totps.userId, userId));

    // Retorna JSON para download
    event.node.res.setHeader('Content-Type', 'application/json');
    event.node.res.setHeader('Content-Disposition', 'attachment; filename="totps-export.json"');

    return {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        count: rows.length,
        totps: rows,
    };
});
