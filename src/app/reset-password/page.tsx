import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import NextLink from 'next/link';
import { Text, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { checkRateLimit, PASSWORD_RESET_LIMITS } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/client-ip';
import { ResetPasswordForm } from './reset-password-form';
import SigninContainer from '@/ui/signin-container';

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  if (AUTH_MODE !== 'credentials') {
    redirect('/signin');
  }

  const params = await searchParams;
  const token = params.token;
  const invalidToken = params.error === 'INVALID_TOKEN';
  const rateLimited = params.error === 'rate_limit';

  const resetPassword = async (formData: FormData) => {
    'use server';
    const ip = await getClientIp();
    if (!checkRateLimit(ip, PASSWORD_RESET_LIMITS.resetPassword)) {
      const tokenFromForm = formData.get('token') as string;
      const q = new URLSearchParams({ error: 'rate_limit' });
      if (tokenFromForm) q.set('token', tokenFromForm);
      redirect(`/reset-password?${q.toString()}`);
    }
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const tokenFromForm = formData.get('token') as string;
    if (!newPassword || !tokenFromForm || newPassword !== confirmPassword) return;
    await auth.api.resetPassword({
      body: { newPassword, token: tokenFromForm }
    });
    redirect('/signin');
  };

  const t = await getTranslations('ResetPasswordPage');
  return (
    <SigninContainer title={t('title')}>
      {rateLimited && (
        <Text as="p" color="red">
          {t('rateLimitError')}
        </Text>
      )}
      {invalidToken ? (
        <Text as="p" color="red">
          {t('invalidToken')}
        </Text>
      ) : token ? (
        <>
          <Text as="p">{t('description')}</Text>
          <ResetPasswordForm
            action={resetPassword}
            token={token}
            passwordPlaceholder={t('passwordPlaceholder') ?? ''}
            confirmPlaceholder={t('confirmPlaceholder') ?? ''}
            buttonLabel={t('button') ?? ''}
            passwordMismatchError={t('passwordMismatch') ?? ''}
          />
        </>
      ) : (
        <Text as="p">{t('missingToken')}</Text>
      )}
      <Link asChild>
        <NextLink href="/signin">{t('signInLink')}</NextLink>
      </Link>
    </SigninContainer>
  );
}
