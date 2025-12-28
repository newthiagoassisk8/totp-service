import { z } from 'zod';

/**
 * Allowed enums
 */
const AlgorithmEnum = z.enum(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);

const EncodingEnum = z.enum(['hex', 'ascii']);

/**
 * Item schema
 */
export const TotpItemSchema = z.object({
    label: z.string().trim().min(1).optional(),

    secret: z.string().min(10, 'secret must have at least 10 characters'),

    digits: z.number().int().positive().optional(),

    period: z.number().int().positive().optional(),

    algorithm: AlgorithmEnum.optional(),

    encoding: EncodingEnum.optional(),
});

/**
 * Root payload
 */
export const TotpPayloadSchema = z.object({
    items: z.array(TotpItemSchema).min(1),
});
