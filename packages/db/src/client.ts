import { drizzle } from 'drizzle-orm/postgres-js';

import * as schema from "./schema";

export function createDb(databaseUrl: string) {
 
  return drizzle(databaseUrl, { schema });
}

export type DB = ReturnType<typeof createDb>;
