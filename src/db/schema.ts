import 'dotenv/config';

import { integer, json, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
});

export const authTokens = pgTable('auth_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export const totps = pgTable('totps', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    label: varchar('label', { length: 255 }).notNull(),
    icon: varchar('icon', { length: 255 }),
    metadata: json('metadata'),
    sort: integer('sort'),

    secret: varchar('secret', { length: 255 }).notNull(),
    digits: integer('digits').default(6).notNull(),
    period: integer('period').default(30).notNull(),
    algorithm: varchar('algorithm', { length: 32 }),
});
