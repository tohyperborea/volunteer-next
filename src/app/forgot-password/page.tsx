import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import { checkRateLimit, PASSWORD_RESET_LIMITS } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/client-ip';
import { verifyTurnstile } from '@/lib/turnstile';
import styles from '../signin/styles.module.css';
import { ForgotPasswordForm } from './forgot-password-form';

const MIN_RESPONSE_DELAY_MS = 400;

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  if (AUTH_MODE !== 'credentials') {
    redirect('/signin');
  }

  const params = await searchParams;
  const sent = params.sent === '1';
  const error = params.error;

  const requestReset = async (formData: FormData) => {
    'use server';
    const ip = await getClientIp();
    if (!checkRateLimit(ip, PASSWORD_RESET_LIMITS.requestReset)) {
      redirect('/forgot-password?error=rate_limit');
    }
    const email = (formData.get('email') as string)?.trim();
    const turnstileToken = (formData.get('cf-turnstile-response') as string)?.trim() || null;
    const verify = await verifyTurnstile(turnstileToken, ip);
    if (!verify.success) {
      redirect('/forgot-password?error=captcha');
    }
    if (!email) return;
    const start = Date.now();
    const baseUrl = process.env.BETTER_AUTH_URL ?? '';
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${baseUrl}/reset-password`
      }
    });
    const elapsed = Date.now() - start;
    if (elapsed < MIN_RESPONSE_DELAY_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESPONSE_DELAY_MS - elapsed));
    }
    redirect('/forgot-password?sent=1');
  };

  const t = await getTranslations('ForgotPasswordPage');
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      <Text as="p">{t('description')}</Text>
      {error === 'rate_limit' && (
        <Text as="p" size="2" color="red">
          {t('rateLimitError')}
        </Text>
      )}
      {error === 'captcha' && (
        <Text as="p" size="2" color="red">
          {t('captchaError')}
        </Text>
      )}
      {sent ? (
        <Text as="p" size="2">
          {t('successMessage')}
        </Text>
      ) : (
        <ForgotPasswordForm
          requestReset={requestReset}
          emailPlaceholder={t('emailPlaceholder') ?? ''}
          buttonText={t('button')}
        />
      )}
      <Link href="/signin" className={styles.signinLink}>
        {t('signInLink')}
      </Link>
    </Flex>
  );
}
