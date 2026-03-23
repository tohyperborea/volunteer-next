'use client';

import NextLink from 'next/link';
import { useCallback, useRef, useState, useTransition } from 'react';
import { Text, AlertDialog, Button, TextField, Flex, Link } from '@radix-ui/themes';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
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
        <Link asChild>
          <NextLink href="/signin">{t('backToSignIn')}</NextLink>
        </Link>
      </>
    );
  }

  if (view === 'forgot') {
    return (
      <Flex direction="column" gap="4">
        <Text as="p">{t('forgotDescription')}</Text>
        <form action={requestResetAction}>
          <Flex direction="column" gap="4">
            <TextField.Root
              name="email"
              placeholder={t('emailPlaceholder') ?? ''}
              autoComplete="email"
              required
            />
            <Button type="submit">{t('forgotButton')}</Button>
            <Button variant="ghost" onClick={showSignIn}>
              {t('backToSignIn')}
            </Button>
          </Flex>
        </form>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Text as="p">{t('signInToAccount')}</Text>
      <Flex asChild direction="column" gap="5">
        <form onSubmit={handleSignIn}>
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />
          <Flex direction="column" gap="2">
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
          </Flex>
          <Button type="submit" disabled={isPending}>
            {isPending ? '...' : t('buttonCredentials')}
          </Button>
          <Flex direction="column" gap="2" align="center">
            <Link asChild>
              <NextLink
                href={`/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              >
                {t('createAccount')}
              </NextLink>
            </Link>
            <Button type="button" variant="soft" color="gray" onClick={showForgot}>
              {t('forgotPassword')}
            </Button>
          </Flex>
        </form>
      </Flex>

      <AlertDialog.Root
        open={showErrorDialog}
        onOpenChange={(open) => {
          if (!open) passwordRef.current && (passwordRef.current.value = '');
          setShowErrorDialog(open);
        }}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>
            {errorReason === 'locked'
              ? t('tooManyAttemptsTitle')
              : errorReason === 'rate_limit'
                ? t('tooManyAttemptsTitle')
                : t('invalidCredentialsTitle')}
          </AlertDialog.Title>
          <AlertDialog.Description>
            {errorReason === 'locked'
              ? t('tooManyAttempts')
              : errorReason === 'rate_limit'
                ? t('rateLimitError')
                : t('invalidCredentials')}
          </AlertDialog.Description>
          <Flex justify="end" mt="4">
            <AlertDialog.Action>
              <Button type="button">{t('errorDialogClose')}</Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
}
