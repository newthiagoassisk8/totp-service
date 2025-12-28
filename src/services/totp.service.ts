import '@/dotenv-loader.js';

import { eq } from 'drizzle-orm';
import { H3Error } from 'h3';
import type { TOTPAlgorithm, TOTPEncoding } from 'totp-generator';
import { TOTP } from 'totp-generator';

import { db } from '@/db/client.js';
import { totps } from '@/db/schema.js';

export async function listTotps(userId: string) {
    return db.select().from(totps).where(eq(totps.userId, userId));
}

export const algorithmValues = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
export const encodingValues = ['hex', 'ascii'];

export function isTOTPEncoding(value: string): value is TOTPEncoding {
    return encodingValues.includes(value as TOTPEncoding);
}

export function isTOTPAlgorithm(value: string): value is TOTPAlgorithm {
    return algorithmValues.includes(value as TOTPAlgorithm);
}

export function normalizeAlgorithm(value: unknown): TOTPAlgorithm {
    const algorithm = String(value ?? '')
        .toUpperCase()
        .trim();

    if (isTOTPAlgorithm(algorithm)) {
        return algorithm;
    }

    return 'SHA-1';
}

export class InvalidParamError extends Error {}

export function normalizeEncoding(value: unknown): TOTPEncoding {
    const encoding = String(value ?? '')
        .toLowerCase()
        .trim();

    if (isTOTPEncoding(encoding)) {
        return encoding;
    }

    return 'hex';
}

export async function generateTotp(totp: any) {
    totp = totp && typeof totp === 'object' && !Array.isArray(totp) ? totp : null;

    if (!totp) {
        throw new InvalidParamError(`Invalid totp data`);
    }

    let secret = String(totp?.secret || '')?.trim();

    if (!secret) {
        throw new H3Error(`Invalid totp secret`);
    }

    let period = Number(totp?.period || 30) || 30;
    let encoding = normalizeEncoding(totp?.encoding);
    const algorithm = normalizeAlgorithm(totp?.encoding);
    let digits = [6, 7, 8].includes(Number(totp?.digits)) ? Number(totp?.digits) : 6;

    let demoTotp = {
        key: 'JBSWY3DPEHPK3PXP',
        opts: { digits: 6, algorithm: 'SHA-256', period: 30 },
    };

    const generatedAtTime = Date.now();
    const generatedAt = new Date(generatedAtTime);

    const { otp, expires } = await TOTP.generate(secret, {
        digits, // number;
        period: period >= 15 && period <= 60 ? period : undefined, // number;
        algorithm: algorithm ?? undefined, // TOTPAlgorithm;
        encoding: encoding ?? undefined, // TOTPEncoding;
    });

    return {
        id: totp?.id || undefined,
        label: totp?.label || '',
        icon: totp?.icon || null,
        otp,
        expires,
        expiresDate: new Date(expires),
        expiresDateTime: new Date(expires),
        digits,
        generatedAt,
        generatedAtTime,
    };
}
