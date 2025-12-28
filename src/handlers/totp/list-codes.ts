import { defineEventHandler } from 'h3';
import { getUserIdFromRequest } from '@/auth/token.js';
import { listTotps, generateTotp } from '@/services/totp.service.js';

export default defineEventHandler(async (event) => {
    const userId = await getUserIdFromRequest(event);
    if (!userId) return [];

    const rows = await listTotps(userId);
    return Promise.all(rows.map(generateTotp));
});
