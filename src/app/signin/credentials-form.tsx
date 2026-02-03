'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Text } from '@radix-ui/themes';
import styles from './styles.module.css';

type View = 'signin' | 'forgot' | 'forgotSent';

export type CredentialsFormTranslations = {
  descriptionOne: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  buttonCredentials: string;
  createAccount: string;
  forgotPassword: string;
  forgotDescription: string;
  forgotButton: string;
  forgotSuccessMessage: string;
  backToSignIn: string;
};

type Props = {
  callbackUrl: string;
  forgotSent: boolean;
  signInAction: (formData: FormData) => Promise<void>;
  requestResetAction: (formData: FormData) => Promise<void>;
  translations: CredentialsFormTranslations;
};

export function CredentialsForm({
  callbackUrl,
  forgotSent,
  signInAction,
  requestResetAction,
  translations: t
}: Props) {
  const [view, setView] = useState<View>(forgotSent ? 'forgotSent' : 'signin');

  const showForgot = useCallback(() => setView('forgot'), []);
  const showSignIn = useCallback(() => setView('signin'), []);

  if (view === 'forgotSent') {
    return (
      <>
        <Text as="p" size="2">
          {t.forgotSuccessMessage}
        </Text>
        <Link href="/signin" className={styles.signinLink}>
          {t.backToSignIn}
        </Link>
      </>
    );
  }

  if (view === 'forgot') {
    return (
      <>
        <Text as="p">{t.forgotDescription}</Text>
        <form action={requestResetAction} className={styles.signinForm}>
          <input
            type="email"
            name="email"
            placeholder={t.emailPlaceholder ?? ''}
            className={styles.signinInput}
            autoComplete="email"
            required
          />
          <button type="submit" className={styles.signinButton}>
            {t.forgotButton}
          </button>
          <button type="button" className={styles.signinLinkButton} onClick={showSignIn}>
            {t.backToSignIn}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <Text as="p">{t.descriptionOne}</Text>
      <form action={signInAction} className={styles.signinForm}>
        <input type="hidden" name="callbackUrl" defaultValue={callbackUrl ?? ''} />
        <input
          type="email"
          name="email"
          placeholder={t.emailPlaceholder ?? ''}
          className={styles.signinInput}
          autoComplete="email"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={t.passwordPlaceholder ?? ''}
          className={styles.signinInput}
          autoComplete="current-password"
          required
        />
        <button type="submit" className={styles.signinButton}>
          {t.buttonCredentials}
        </button>
        <div className={styles.signinLinks}>
          <Link href={`/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className={styles.signinLink}>
            {t.createAccount}
          </Link>
          <button type="button" className={styles.signinLinkButton} onClick={showForgot}>
            {t.forgotPassword}
          </button>
        </div>
      </form>
    </>
  );
}
