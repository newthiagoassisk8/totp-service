import { defineEventHandler, readBody } from 'h3';
import { getUserIdFromRequest } from '@/auth/token.js';
import { db } from '@/db/client.js';
import { totps } from '@/db/schema.js';

export default defineEventHandler(async (event) => {
    const userId = await getUserIdFromRequest(event);
    if (!userId) {
        event.node.res.statusCode = 401;
        return { error: 'unauthorized' };
    }

    const body = await readBody(event);

    if (!body?.totps || !Array.isArray(body.totps)) {
        event.node.res.statusCode = 400;
        return { error: 'totps array is required' };
    }

    // Validar estrutura básica
    for (const totp of body.totps) {
        if (!totp.label || !totp.secret) {
            event.node.res.statusCode = 400;
            return { error: 'each TOTP must have label and secret' };
        }
    }

    // Inserir TOTPs em lote
    const imported = await db
        .insert(totps)
        .values(
            body.totps.map((totp: any) => ({
                userId,
                label: totp.label,
                secret: totp.secret,
                digits: totp.digits ?? 6,
                period: totp.period ?? 30,
                algorithm: totp.algorithm,
                icon: totp.icon,
                metadata: totp.metadata,
                sort: totp.sort,
            }))
        )
        .returning();

    return {
        success: true,
        imported: imported.length,
        data: imported,
    };
});
