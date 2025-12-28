import { defineEventHandler, readBody } from 'h3';
import { revokeToken } from '@/services/auth.service.js';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body?.token) {
        event.node.res.statusCode = 400;
        return { error: 'token is required' };
    }

    await revokeToken(body.token);
    return { success: true };
});
