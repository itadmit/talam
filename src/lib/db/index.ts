import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgresJs from "postgres";
import * as schema from "./schema";

type DbType = NeonHttpDatabase<typeof schema> | ReturnType<typeof drizzlePostgres<typeof schema>>;

let _db: DbType | null = null;

function getDb(): DbType {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Use Neon HTTP driver for Neon URLs, postgres.js for local
  if (connectionString.includes("neon.tech") || connectionString.includes("neon.")) {
    const sql = neon(connectionString);
    _db = drizzleNeon(sql, { schema });
  } else {
    const client = postgresJs(connectionString);
    _db = drizzlePostgres(client, { schema });
  }

  return _db;
}

// Proxy to lazily initialize DB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = new Proxy({}, {
  get(_target, prop) {
    const realDb = getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (realDb as any)[prop];
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

export type DB = typeof db;
