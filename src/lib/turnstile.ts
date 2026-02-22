/**
 * Cloudflare Turnstile server-side verification.
 * Set TURNSTILE_SECRET_KEY in env to enable. Optional NEXT_PUBLIC_TURNSTILE_SITE_KEY for the widget.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileVerifyResult = { success: true } | { success: false; errorCodes: string[] };

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteip?: string | null
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true }; // Skip verification when not configured
  if (!token?.trim()) return { success: false, errorCodes: ['missing-input-response'] };

  try {
    const body: Record<string, string> = {
      secret,
      response: token.trim()
    };
    if (remoteip) body.remoteip = remoteip;

    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = (await res.json()) as {
      success?: boolean;
      'error-codes'?: string[];
    };
    if (data.success) return { success: true };
    return {
      success: false,
      errorCodes: Array.isArray(data['error-codes']) ? data['error-codes'] : ['unknown']
    };
  } catch {
    return { success: false, errorCodes: ['internal-error'] };
  }
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.TURNSTILE_SITE_KEY);
}
