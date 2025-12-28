import '../dotenv-loader.ts';

import { boolean, index, integer, json, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
    'users',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        password: varchar('password', { length: 255 }).notNull(),
    },
    (table) => [uniqueIndex('users_email_unique').on(table.email)]
);

export const authTokens = pgTable(
    'auth_tokens',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        token: varchar('token', { length: 255 }).notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true }),
        keep: boolean('keep').default(false).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index('auth_tokens_user_idx').on(table.userId), uniqueIndex('auth_tokens_token_unique').on(table.token)]
);

export const totps = pgTable(
    'totps',
    {
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
        algorithm: varchar('algorithm', { length: 32 }), // 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'
        encoding: varchar('encoding', { length: 32 }), // 'hex', 'ascii'
    },
    (table) => [index('totps_user_idx').on(table.userId), index('totps_sort_idx').on(table.sort)]
);
