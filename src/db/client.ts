import '../dotenv-loader.js';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const sql = postgres(process.env.DATABASE_URL!, {
    max: 1, // serverless safe
    // ssl: false,
});

export const db = drizzle(sql);
