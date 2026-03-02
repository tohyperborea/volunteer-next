'use client';

import Script from 'next/script';
import { Button, TextField } from '@radix-ui/themes';

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

type Props = {
  requestReset: (formData: FormData) => Promise<void>;
  emailPlaceholder: string;
  buttonText: string;
};

export function ForgotPasswordForm({ requestReset, emailPlaceholder, buttonText }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <>
      {siteKey && <Script src={TURNSTILE_SCRIPT} strategy="lazyOnload" />}
      <form
        action={requestReset}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <TextField.Root
          name="email"
          aria-labelledby="email-label"
          id="email"
          placeholder={emailPlaceholder}
          autoComplete="email"
          required
        />
        {siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-size="normal" />}
        <Button type="submit">{buttonText}</Button>
      </form>
    </>
  );
}
