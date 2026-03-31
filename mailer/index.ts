import cron from 'node-cron';
import { Pool } from 'pg';

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 * * *';
const RATE_LIMIT = Number(process.env.RATE_LIMIT) || undefined; // emails per hour
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'example';
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;

console.log(
  `Mailer service started with schedule: ${CRON_SCHEDULE} and rate limit: ${RATE_LIMIT || 'none'}`
);
console.log(`Connecting to PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT} as ${POSTGRES_USER}...`);

const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  port: POSTGRES_PORT
});

console.log('Starting scheduled task...');

cron.schedule(CRON_SCHEDULE, async () => {
  console.log('Running scheduled task to send emails...');
  const result = await pool.query(`
    SELECT "id", "to", "subject", "body"
    FROM email
    WHERE
      "sentAt" IS NULL AND
      ("sendAfter" IS NULL OR "sendAfter" <= NOW())
    ORDER BY "createdAt" ASC
    ${RATE_LIMIT ? `LIMIT ${RATE_LIMIT}` : ''}
  `);
  const sentIds = [];
  for (const row of result.rows) {
    const { to, subject, body } = row;
    try {
      console.log(`to: ${to} [${subject}] :: ${body}`);
      sentIds.push(row.id);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }
  if (sentIds.length > 0) {
    const result = await pool.query(
      `
      UPDATE email
      SET "sentAt" = NOW()
      WHERE id = ANY($1::uuid[])
    `,
      [sentIds]
    );
    console.log(`Marked ${result.rowCount} emails as sent.`);
  }
});
