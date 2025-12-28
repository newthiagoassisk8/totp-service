/*
tsx src/db/demo/eloquent-style.ts
*/
import { eq, like } from 'drizzle-orm';

import UserModel from '../models/UserModel.js';
import { users } from '../schema.js';

// where + first
const user = await UserModel.where(eq(users.email, 'demo@email.com')).first();

// where + get
const allUsers = await UserModel.where(eq(users.name, 'Demo User')).get();

// where + limit + get
const limited = await UserModel.where(like(users.name, '%Demo%')).limit(5).get();

console.log({
    user,
    allUsers,
    limited,
});
