import postgres from 'postgres';

const isPooler = (process.env.DATABASE_URL ?? '').includes(':6543');

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: !isPooler,  // pooler (PgBouncer) requires prepare:false; direct connection can use prepared statements
  ssl: 'require',
  max: isPooler ? 10 : 3,
  idle_timeout: 20,
});

export default sql;
