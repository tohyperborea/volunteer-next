'use client';

import Script from 'next/script';
import styles from '../signin/styles.module.css';

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
      {siteKey && (
        <Script src={TURNSTILE_SCRIPT} strategy="lazyOnload" />
      )}
      <form action={requestReset} className={styles.signinForm}>
        <input
          type="email"
          name="email"
          placeholder={emailPlaceholder}
          className={styles.signinInput}
          autoComplete="email"
          required
        />
        {siteKey && (
          <div
            className="cf-turnstile"
            data-sitekey={siteKey}
            data-size="normal"
          />
        )}
        <button type="submit" className={styles.signinButton}>
          {buttonText}
        </button>
      </form>
    </>
  );
}
