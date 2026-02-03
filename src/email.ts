/**
 * Email sending for auth flows (password reset, etc.).
 * Configure SMTP_* in .env.local; if unset, no email is sent (dev fallback in auth logs the link).
 */

import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  await transporter.sendMail({
    from: from ?? 'noreply@localhost',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
}
