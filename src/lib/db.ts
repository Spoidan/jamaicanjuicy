import postgres from 'postgres';

const isPooler = (process.env.DATABASE_URL ?? '').includes(':6543');

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  ssl: 'require',
  max: isPooler ? 10 : 3,
  idle_timeout: 20,
  types: {
    jsonb: {
      to: 3802,
      from: [3802],
      serialize: JSON.stringify,
      parse: JSON.parse,
    },
    json: {
      to: 114,
      from: [114],
      serialize: JSON.stringify,
      parse: JSON.parse,
    },
  },
});

export default sql;
