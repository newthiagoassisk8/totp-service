import '../dotenv-loader.js';

import { hash } from 'bcryptjs';
import { and, eq } from 'drizzle-orm';

import { db } from './client.js';
import { authTokens, totps, users } from './schema.js';

async function userSeed(userData: any) {
    if (!userData?.name || !userData?.email) {
        return;
    }

    let password = userData?.password || 'pass123';
    const hashedPassword = await hash(password, 10);

    // Buscar usuário existente
    let user = (await db.select().from(users).where(eq(users.email, userData?.email)).limit(1))[0] ?? null;

    if (!user) {
        // Criar novo usuário
        const result = await db
            .insert(users)
            .values({
                name: userData?.name,
                email: userData?.email,
                password: hashedPassword,
            })
            .returning();
        user = result[0] ?? null;
        console.log('✅ User created:');
    } else {
        // Atualizar usuário existente
        const result = await db
            .update(users)
            .set({
                name: userData?.name,
                password: hashedPassword,
            })
            .where(eq(users.id, user.id))
            .returning();
        user = result[0] ?? null;
        console.log('✅ User updated:');
    }

    if (!user) {
        console.log('❌ Fail on seed user: ', userData?.email);
        return;
    }

    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log(`   Password: ${password}`);

    if (!['demo@email.com'].includes(userData?.email)) {
        return;
    }

    // Verificar se token já existe
    const existingToken =
        (
            await db.select().from(authTokens).where(eq(authTokens.token, 'c8eeaabf3ef14ffc811cab37ba16753f')).limit(1)
        )[0] ?? null;

    if (!existingToken) {
        await db.insert(authTokens).values({
            userId: user.id,
            token: 'c8eeaabf3ef14ffc811cab37ba16753f',
            expiresAt: new Date('2099-12-31T23:59:59Z'),
            keep: true,
        });
        console.log('   Token created: c8eeaabf3ef14ffc811cab37ba16753f');
    } else {
        console.log('   Token exists: ' + existingToken.token);
    }

    // Verificar se TOTP demo já existe (busca por secret)
    const demoSecret = 'JBSWY3DPEHPK3PXP';
    const existingTotp =
        (
            await db
                .select()
                .from(totps)
                .where(and(eq(totps.userId, user.id), eq(totps.secret, demoSecret)))
                .limit(1)
        )[0] ?? null;

    if (!existingTotp) {
        await db.insert(totps).values({
            userId: user.id,
            label: 'Demo TOTP',
            secret: demoSecret,
            digits: 6,
            period: 30,
        });
        console.log('   Demo TOTP created');
    } else {
        // Atualizar TOTP existente
        await db
            .update(totps)
            .set({
                label: 'Demo TOTP',
                digits: 6,
                period: 30,
            })
            .where(eq(totps.id, existingTotp.id));
        console.log('   Demo TOTP updated');
    }
}

async function userSeeder() {
    const users = [
        {
            name: 'Demo User',
            email: 'demo@email.com',
            password: 'pass123',
        },
    ];

    for (let userData of users) {
        await userSeed(userData);
    }
}

export async function seed() {
    await userSeeder();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seed()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('❌ Seed failed:', err);
            process.exit(1);
        });
}
