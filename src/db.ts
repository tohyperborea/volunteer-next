/**
 * Database connection pool setup using pg library
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: Number(process.env.POSTGRES_PORT) || 5432
});

export const inTransaction = async <R>(
  serviceCalls: (client: PoolClient) => Promise<R>
): Promise<R> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await serviceCalls(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    console.error('Rolling back transaction due to error:', error);
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
