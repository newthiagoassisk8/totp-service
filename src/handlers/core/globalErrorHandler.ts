import { defineEventHandler, H3Error } from 'h3';

export default defineEventHandler((event: any) => {
    const error = event?.error || null;
    if (!error) return;

    if (error instanceof H3Error) {
        event.node.res.statusCode = error.statusCode ?? 500;

        return {
            success: false,
            error: error.statusMessage,
            data: error.data ?? null,
        };
    }

    console.error('[Unhandled]', error);

    event.node.res.statusCode = 500;
    return {
        success: false,
        error: 'Internal Server Error',
    };
});
