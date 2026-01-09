import { Pool, PoolClient, QueryResult } from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const maxPool = Number(process.env.DB_MAX_POOL || 10);
const useSsl = process.env.DB_SSL === 'true';

const pool = new Pool({
  connectionString: connectionString || undefined,
  max: maxPool,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

type QueryArgs = any[] | undefined;

export default {
  query: (text: string, params?: QueryArgs): Promise<QueryResult> => {
    return pool.query(text, params);
  },

  getClient: async (): Promise<PoolClient> => {
    return pool.connect();
  },

  pool
};
