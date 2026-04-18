import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,   // required for Supabase connection pooler (PgBouncer)
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
});

export default sql;
