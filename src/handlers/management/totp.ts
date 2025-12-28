import { defineEventHandler, readBody } from 'h3';
import { getUserIdFromRequest } from '@/auth/token.js';
import { db } from '@/db/client.js';
import { totps } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const userId = await getUserIdFromRequest(event);
    if (!userId) {
        event.node.res.statusCode = 401;
        return { error: 'unauthorized' };
    }

    if (event.node.req.method === 'POST') {
        const body = await readBody(event);

        if (!body.label || !body.secret) {
            event.node.res.statusCode = 400;
            return { error: 'label and secret are required' };
        }

        const [created] = await db
            .insert(totps)
            .values({
                userId,
                label: body.label,
                secret: body.secret,
                digits: body.digits ?? 6,
                period: body.period ?? 30,
                algorithm: body.algorithm,
                icon: body.icon,
                metadata: body.metadata,
                sort: body.sort,
            })
            .returning();

        return { success: true, data: created };
    }

    if (event.node.req.method === 'PUT' || event.node.req.method === 'PATCH') {
        const body = await readBody(event);

        if (!body.id) {
            event.node.res.statusCode = 400;
            return { error: 'id is required' };
        }

        const updateData: any = {};
        if (body.label !== undefined) updateData.label = body.label;
        if (body.secret !== undefined) updateData.secret = body.secret;
        if (body.digits !== undefined) updateData.digits = body.digits;
        if (body.period !== undefined) updateData.period = body.period;
        if (body.algorithm !== undefined) updateData.algorithm = body.algorithm;
        if (body.icon !== undefined) updateData.icon = body.icon;
        if (body.metadata !== undefined) updateData.metadata = body.metadata;
        if (body.sort !== undefined) updateData.sort = body.sort;

        const [updated] = await db
            .update(totps)
            .set(updateData)
            .where(and(eq(totps.id, body.id), eq(totps.userId, userId)))
            .returning();

        if (!updated) {
            event.node.res.statusCode = 404;
            return { error: 'TOTP not found or access denied' };
        }

        return { success: true, data: updated };
    }

    if (event.node.req.method === 'DELETE') {
        const body = await readBody(event);

        if (!body.id) {
            event.node.res.statusCode = 400;
            return { error: 'id is required' };
        }

        const [deleted] = await db
            .delete(totps)
            .where(and(eq(totps.id, body.id), eq(totps.userId, userId)))
            .returning();

        if (!deleted) {
            event.node.res.statusCode = 404;
            return { error: 'TOTP not found or access denied' };
        }

        return { success: true, data: deleted };
    }

    event.node.res.statusCode = 405;
    return { error: 'method not allowed' };
});
