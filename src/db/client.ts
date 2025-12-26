import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const sql = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    max: 1, // serverless safe
});

export const db = drizzle(sql);
