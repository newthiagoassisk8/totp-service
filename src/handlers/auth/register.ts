import { defineEventHandler, readBody } from 'h3';
import { hash } from 'bcryptjs';
import { db } from '@/db/client.js';
import { users } from '@/db/schema.js';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body?.name || !body?.email || !body?.password) {
        event.node.res.statusCode = 400;
        return { error: 'name, email and password are required' };
    }

    // Verificar se email já existe
    const [existing] = await db.select().from(users).where(eq(users.email, body.email));

    if (existing) {
        event.node.res.statusCode = 409;
        return { error: 'email already exists' };
    }

    // Criar usuário
    const [user] = await db
        .insert(users)
        .values({
            name: body.name,
            email: body.email,
            password: await hash(body.password, 10),
        })
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
        });

    return {
        success: true,
        data: user,
    };
});
