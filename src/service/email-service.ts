/**
 * Service for managing the email queue
 * @since 2026-03-31
 * @author Michael Townsend <@continuities>
 */

import pool from '@/db';

/**
 * Queues an email to be sent later. If a key is provided and an unsent email with the same key already exists, it will be updated with the new details instead of creating a duplicate entry.
 * @param param0 - The email details to queue
 * @returns A promise that resolves when the email has been queued
 */
export const queueEmail = async ({
  key,
  to,
  body,
  subject,
  sendAfter
}: {
  key?: string;
  to: string;
  body: string;
  subject: string;
  sendAfter?: Date;
}): Promise<void> => {
  const columns = ['to', 'subject', 'body'];
  const values: any[] = [to, subject, body];
  if (key) {
    columns.unshift('key');
    values.unshift(key);
  }
  if (sendAfter) {
    columns.push('sendAfter');
    values.push(sendAfter);
  }
  await pool.query(
    `
    INSERT INTO "email" (${columns.map((col) => `"${col}"`).join(', ')})
    VALUES (${columns.map((_, idx) => `$${idx + 1}`).join(', ')})
    ON CONFLICT ("key") WHERE "sentAt" IS NULL
    DO UPDATE SET
      "to" = EXCLUDED."to",
      "subject" = EXCLUDED."subject",
      "body" = EXCLUDED."body",
      "sendAfter" = EXCLUDED."sendAfter",
      "createdAt" = CURRENT_TIMESTAMP
    `,
    values
  );
};
