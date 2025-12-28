import '../dotenv-loader.js';

import { eq } from 'drizzle-orm';

import { db } from './client.js';
import { authTokens, totps, users } from './schema.js';

async function cleanup() {
    console.log('🧹 Cleaning up demo user...');
    await db
        .delete(totps)
        .where(eq(totps.userId, (await db.select().from(users).where(eq(users.email, 'demo@email.com')))[0]?.id));
    await db
        .delete(authTokens)
        .where(eq(authTokens.userId, (await db.select().from(users).where(eq(users.email, 'demo@email.com')))[0]?.id));
    await db.delete(users).where(eq(users.email, 'demo@email.com'));
    console.log('✅ Cleanup completed\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    cleanup()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('❌ Cleanup failed:', err);
            process.exit(1);
        });
}
