/**
 * Database connection pool setup using pg library
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: Number(process.env.POSTGRES_PORT) ?? 5432
});

export default pool;
