import type { SQL } from 'drizzle-orm';

import { db } from '../client.js';

export type WhereClause = SQL;

export default abstract class BaseModel<TTable> {
    protected table: TTable;
    protected wheres: WhereClause[] = [];
    protected limitValue?: number;

    protected constructor(table: TTable) {
        this.table = table;
    }

    /* -----------------------------------------------------------------
     |  Query Builder
     | -----------------------------------------------------------------*/

    where(condition: WhereClause): this {
        this.wheres.push(condition);
        return this;
    }

    limit(value: number): this {
        this.limitValue = value;
        return this;
    }

    /* -----------------------------------------------------------------
     |  Executors
     | -----------------------------------------------------------------*/

    async get(): Promise<any[]> {
        let query: any = db.select().from(this.table as any);

        for (const where of this.wheres) {
            query = query.where(where);
        }

        if (this.limitValue !== undefined) {
            query = query.limit(this.limitValue);
        }

        return query;
    }

    async first(): Promise<any | null> {
        this.limit(1);
        const result = await this.get();
        return result[0] ?? null;
    }

    /* -----------------------------------------------------------------
     |  Static shortcuts (Eloquent-style)
     | -----------------------------------------------------------------*/

    static where<T extends BaseModel<any>>(this: new () => T, condition: WhereClause): T {
        return new this().where(condition);
    }

    static limit<T extends BaseModel<any>>(this: new () => T, value: number): T {
        return new this().limit(value);
    }
}
