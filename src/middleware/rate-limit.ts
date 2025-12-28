const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(max = 120, windowMs = 60_000) {
    return (event: any) => {
        const ip = event.node.req.headers['x-forwarded-for'] ?? event.node.req.socket.remoteAddress ?? 'unknown';

        const now = Date.now();
        const record = hits.get(ip);

        if (!record || record.reset < now) {
            hits.set(ip, { count: 1, reset: now + windowMs });
            return;
        }

        if (record.count >= max) {
            event.node.res.statusCode = 429;
            return 'Too Many Requests';
        }

        record.count++;
    };
}
