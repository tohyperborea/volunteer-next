/**
 * A simple API endpoint to check if the server is running and the database connection is working.
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import dbConnectionPool from '@/db';

export const GET = async (): Promise<Response> => {
  try {
    const r = await dbConnectionPool.query('SELECT 1 as value'); // Example query to use the db connection pool
    const valueString = JSON.stringify(r.rows[0]?.value);
    return Response.json({ message: `Pong! [${valueString}]` });
  } catch (error) {
    console.error('Database connection error:', error);
    return Response.json({ message: 'Database connection error', error }, { status: 500 });
  }
};
