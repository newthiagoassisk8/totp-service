import { createError, defineEventHandler, readBody } from 'h3';

import { generateTotp } from '@/services/totp.service.js';
import { TotpPayloadSchema } from '@/validation/totp.schema.js';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const result = TotpPayloadSchema.safeParse(body);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid payload',
            data: JSON.parse(`${result.error}`),
        });
    }

    const { items } = result.data;

    return Promise.all(
        items.map((item) =>
            generateTotp({
                label: item.label,
                secret: item.secret,
                digits: item.digits,
                period: item.period,
                algorithm: item.algorithm,
                encoding: item.encoding,
            })
        )
    );
});
