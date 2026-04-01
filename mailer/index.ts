import cron from 'node-cron';
import { createTransport } from 'nodemailer';
import { htmlToText } from 'html-to-text';
import { Pool } from 'pg';

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 * * *';
const RATE_LIMIT = Number(process.env.RATE_LIMIT) || undefined; // emails per cron tick
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'example';
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
const SMTP_USER = process.env.SMTP_USER || 'smtp_user';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'smtp_password';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER ?? 'noreply@localhost';
const FAKE_SEND = process.env.FAKE_SEND === 'true';

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

console.log(
  `Setting up SMTP transporter for ${SMTP_HOST}:${SMTP_PORT} (secure: ${SMTP_SECURE})...`
);

const smtp = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
});

console.log('Starting scheduled task...');

cron.schedule(CRON_SCHEDULE, async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(`
    SELECT "id", "to", "subject", "body"
    FROM email
    WHERE
      "sentAt" IS NULL AND
      ("sendAfter" IS NULL OR "sendAfter" <= NOW())
    ORDER BY "createdAt" ASC
    ${RATE_LIMIT ? `LIMIT ${RATE_LIMIT}` : ''}
    FOR UPDATE SKIP LOCKED
  `);
    const sentIds = [];
    for (const row of result.rows) {
      const { to, subject, body } = row;
      try {
        if (FAKE_SEND) {
          console.log(`to: ${to} [${subject}] :: ${body}`);
        } else {
          await smtp.sendMail({
            from: SMTP_FROM,
            to,
            subject,
            html: body,
            text: htmlToText(body)
          });
        }
        sentIds.push(row.id);
      } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
      }
    }
    if (sentIds.length > 0) {
      const result = await client.query(
        `
      UPDATE email
      SET "sentAt" = NOW()
      WHERE id = ANY($1::uuid[])
    `,
        [sentIds]
      );
      console.log(`Marked ${result.rowCount} emails as sent.`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing emails:', error);
  } finally {
    client.release();
  }
});
