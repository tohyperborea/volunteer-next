/**
 * Email sending for auth flows (password reset, etc.).
 * Configure SMTP_* in .env.local; if unset, no email is sent (dev fallback in auth logs the link).
 *
 * Production: Prefer a secrets manager (e.g. AWS Secrets Manager, Vault) for SMTP credentials
 * instead of plain env vars; inject at runtime and avoid logging or exposing secrets.
 */

import nodemailer from 'nodemailer';

const SMTP_MAX_RETRIES = 3;
const SMTP_RETRY_BASE_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SmtpConfigValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validates SMTP env configuration. Does not log or expose secret values.
 */
export function validateSmtpConfig(): SmtpConfigValidation {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;

  if (!host) return { valid: false, error: 'SMTP_HOST is missing or empty' };
  if (!user) return { valid: false, error: 'SMTP_USER is missing or empty' };
  if (!pass) return { valid: false, error: 'SMTP_PASSWORD is missing' };

  const portRaw = process.env.SMTP_PORT;
  if (portRaw !== undefined && portRaw !== '') {
    const port = Number(portRaw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return { valid: false, error: 'SMTP_PORT must be an integer between 1 and 65535' };
    }
  }

  return { valid: true };
}

function getTransporter(): nodemailer.Transporter | null {
  const validation = validateSmtpConfig();
  if (!validation.valid) return null;

  const host = process.env.SMTP_HOST!.trim();
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASSWORD!;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

/**
 * Sends an email with retries (exponential backoff). Logs failures for monitoring.
 * Returns result so callers can handle delivery failures; does not throw.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<SendEmailResult> {
  const transporter = getTransporter();
  if (!transporter) {
    const validation = validateSmtpConfig();
    const msg = validation.error ?? 'SMTP not configured';
    console.error('[email] Send skipped: %s', msg);
    return { sent: false, error: msg };
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@localhost';
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= SMTP_MAX_RETRIES; attempt++) {
    try {
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      if (process.env.NODE_ENV === 'development') {
        console.info('[email] Sent to %s (subject: %s)', options.to, options.subject);
      }
      return { sent: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const delayMs = SMTP_RETRY_BASE_MS * Math.pow(2, attempt - 1);
      if (attempt < SMTP_MAX_RETRIES) {
        console.warn(
          '[email] Send attempt %d failed, retrying in %dms: %s',
          attempt,
          delayMs,
          lastError.message
        );
        await sleep(delayMs);
      } else {
        console.error(
          '[email] Send failed after %d attempts (to=%s, subject=%s): %s',
          SMTP_MAX_RETRIES,
          options.to,
          options.subject,
          lastError.message
        );
      }
    }
  }

  return {
    sent: false,
    error: lastError?.message ?? 'Unknown error'
  };
}
