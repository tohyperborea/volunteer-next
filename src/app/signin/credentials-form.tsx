'use client';

import Link from 'next/link';
import { useCallback, useRef, useState, useTransition } from 'react';
import { Text, Dialog, Button } from '@radix-ui/themes';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
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
  invalidCredentialsTitle: string;
  invalidCredentials: string;
  errorDialogClose: string;
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const passwordRef = useRef<HTMLInputElement>(null);

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
          await signInAction(formData);
        } catch (error) {
          if (isRedirectError(error)) {
            throw error;
          }
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
      <form onSubmit={handleSignIn} className={styles.signinForm}>
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
          ref={passwordRef}
          type="password"
          name="password"
          placeholder={t.passwordPlaceholder ?? ''}
          className={styles.signinInput}
          autoComplete="current-password"
          required
        />
        <button type="submit" className={styles.signinButton} disabled={isPending}>
          {isPending ? '...' : t.buttonCredentials}
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

      <Dialog.Root
        open={showErrorDialog}
        onOpenChange={(open) => {
          if (!open) passwordRef.current && (passwordRef.current.value = '');
          setShowErrorDialog(open);
        }}
      >
        <Dialog.Content className={styles.errorDialog}>
          
          <Dialog.Title className={styles.errorDialogTitle}>{t.invalidCredentialsTitle}</Dialog.Title>
          <Dialog.Description className={styles.errorDialogDescription}>{t.invalidCredentials}</Dialog.Description>
          <Dialog.Close>
            <Button className={styles.errorDialogCloseButton}>{t.errorDialogClose}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
