import cron from 'node-cron';
import { createTransport } from 'nodemailer';
import { htmlToText } from 'html-to-text';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const readSecret = (name: string, defaultValue?: string): string => {
  const secretPath = path.join('/run/secrets', name);
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf-8').trimEnd();
  }
  return process.env[name] || defaultValue || '';
};

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 * * * *';
const RATE_LIMIT = Number(process.env.RATE_LIMIT) || 100; // emails per cron tick
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = readSecret('POSTGRES_PASSWORD', 'example');
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
const SMTP_USER = process.env.SMTP_USER || 'smtp_user';
const SMTP_PASSWORD = readSecret('SMTP_PASSWORD', 'smtp_password');
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER ?? 'noreply@localhost';
const FAKE_SEND = process.env.FAKE_SEND === 'true';
const MAX_RETRIES = Number(process.env.MAX_RETRIES) || 3;
const USE_GOOGLE_WORKSPACE = process.env.USE_GOOGLE_WORKSPACE === 'true';

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

if (USE_GOOGLE_WORKSPACE) {
  console.log('Using Google Workspace SMTP settings...');
} else {
  console.log(
    `Setting up SMTP transporter for ${SMTP_HOST}:${SMTP_PORT} (secure: ${SMTP_SECURE})...`
  );
}

const smtp = USE_GOOGLE_WORKSPACE
  ? createTransport({
      service: 'GmailWorkspace',
      host: 'smtp-relay.gmail.com',
      name: SMTP_FROM.split('@')[1] // EHLO name should match sending domain for Google Workspace
    })
  : createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
    });

console.log('Starting scheduled task...');

cron.schedule(CRON_SCHEDULE, async () => {
  const client = await pool.connect();
  const values = [MAX_RETRIES];
  if (RATE_LIMIT) {
    values.push(RATE_LIMIT);
  }
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `
        SELECT "id", "to", "subject", "body"
        FROM email
        WHERE
          "retries" < $1 AND
          "sentAt" IS NULL AND
          ("sendAfter" IS NULL OR "sendAfter" <= NOW())
        ORDER BY "createdAt" ASC
        ${RATE_LIMIT ? 'LIMIT $2' : ''}
        FOR UPDATE SKIP LOCKED
      `,
      values
    );
    const sentIds: string[] = [];
    const failedIds: string[] = [];
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
        failedIds.push(row.id);
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
    if (failedIds.length > 0) {
      const result = await client.query(
        `
          UPDATE email
          SET retries = retries + 1
          WHERE id = ANY($1::uuid[])
        `,
        [failedIds]
      );
      console.log(`Marked ${result.rowCount} emails as failed.`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing emails:', error);
  } finally {
    client.release();
  }
});
