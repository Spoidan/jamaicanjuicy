import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
});

/** Parse a value that may come back as a JSON string from PgBouncer */
export function parseJson<T>(v: unknown): T {
  if (typeof v === 'string') return JSON.parse(v) as T;
  return v as T;
}

export default sql;
