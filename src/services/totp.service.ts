import '@/dotenv-loader.js';

import { eq } from 'drizzle-orm';
import { TOTP } from 'totp-generator';

import { db } from '@/db/client.js';
import { totps } from '@/db/schema.js';

export async function listTotps(userId: string) {
    return db.select().from(totps).where(eq(totps.userId, userId));
}

export async function generateTotp(totp: any) {
    const { otp, expires } = await TOTP.generate(totp.secret, {
        digits: totp.digits,
        period: totp.period,
        algorithm: totp.algorithm ?? undefined,
    });

    return {
        id: totp.id,
        label: totp.label,
        otp,
        expires,
        expiresDate: new Date(expires),
        digits: totp.digits,
    };
}
