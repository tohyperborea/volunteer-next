'use client';

import Link from 'next/link';
import { useCallback, useRef, useState, useTransition } from 'react';
import { Text, AlertDialog, Button, TextField } from '@radix-ui/themes';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';

type View = 'signin' | 'forgot' | 'forgotSent';

type SignInResult =
  | { ok: true }
  | { ok: false; reason: 'locked' | 'rate_limit' | 'invalid_credentials' };

type Props = {
  callbackUrl: string;
  forgotSent: boolean;
  signInAction: (formData: FormData) => Promise<SignInResult>;
  requestResetAction: (formData: FormData) => Promise<void>;
};

export function CredentialsForm({
  callbackUrl,
  forgotSent,
  signInAction,
  requestResetAction
}: Props) {
  const [view, setView] = useState<View>(forgotSent ? 'forgotSent' : 'signin');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorReason, setErrorReason] = useState<'locked' | 'rate_limit' | 'invalid_credentials'>(
    'invalid_credentials'
  );
  const [isPending, startTransition] = useTransition();
  const passwordRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('SignInPage');
  const showForgot = useCallback(() => setView('forgot'), []);
  const showSignIn = useCallback(() => setView('signin'), []);

  const handleSignIn = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setShowErrorDialog(false);
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set('callbackUrl', callbackUrl ?? '');

      startTransition(async () => {
        try {
          const result = await signInAction(formData);
          if (result?.ok === false) {
            setErrorReason(result.reason);
            setShowErrorDialog(true);
          }
        } catch (error) {
          if (isRedirectError(error)) {
            throw error;
          }
          setErrorReason('invalid_credentials');
          setShowErrorDialog(true);
        }
      });
    },
    [callbackUrl, signInAction]
  );

  if (view === 'forgotSent') {
    return (
      <>
        <Text as="p" size="2">
          {t('forgotSuccessMessage')}
        </Text>
        <Link href="/signin">{t('backToSignIn')}</Link>
      </>
    );
  }

  if (view === 'forgot') {
    return (
      <>
        <Text as="p">{t('forgotDescription')}</Text>
        <form action={requestResetAction} className={styles.signinForm}>
          <TextField.Root
            name="email"
            placeholder={t('emailPlaceholder') ?? ''}
            autoComplete="email"
            required
          />
          <Button type="submit">{t('forgotButton')}</Button>
          <Button type="button" onClick={showSignIn}>
            {t('backToSignIn')}
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      <Text as="p">{t('title')}</Text>
      <form onSubmit={handleSignIn} className={styles.signinForm}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />
        <TextField.Root
          name="email"
          placeholder={t('emailPlaceholder') ?? ''}
          autoComplete="email"
          required
        />
        <TextField.Root
          name="password"
          type="password"
          placeholder={t('passwordPlaceholder') ?? ''}
          autoComplete="current-password"
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? '...' : t('buttonCredentials')}
        </Button>
        <div className={styles.signinLinks}>
          <Link
            href={`/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          >
            {t('createAccount')}
          </Link>
          <Button type="button" onClick={showForgot}>
            {t('forgotPassword')}
          </Button>
        </div>
      </form>

      <AlertDialog.Root
        open={showErrorDialog}
        onOpenChange={(open) => {
          if (!open) passwordRef.current && (passwordRef.current.value = '');
          setShowErrorDialog(open);
        }}
      >
        <AlertDialog.Content className={styles.errorDialog}>
          <AlertDialog.Title className={styles.errorDialogTitle}>
            {errorReason === 'locked'
              ? t('tooManyAttemptsTitle')
              : errorReason === 'rate_limit'
                ? t('tooManyAttemptsTitle')
                : t('invalidCredentialsTitle')}
          </AlertDialog.Title>
          <AlertDialog.Description className={styles.errorDialogDescription}>
            {errorReason === 'locked'
              ? t('tooManyAttempts')
              : errorReason === 'rate_limit'
                ? t('rateLimitError')
                : t('invalidCredentials')}
          </AlertDialog.Description>
          <AlertDialog.Action>
            <Button type="button">{t('errorDialogClose')}</Button>
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
