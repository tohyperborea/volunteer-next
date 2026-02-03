import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import styles from '../signin/styles.module.css';

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

  const resetPassword = async (formData: FormData) => {
    'use server';
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
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      {invalidToken ? (
        <Text as="p" color="red">
          {t('invalidToken')}
        </Text>
      ) : token ? (
        <>
          <Text as="p">{t('description')}</Text>
          <form action={resetPassword} className={styles.signinForm}>
            <input type="hidden" name="token" value={token ?? ''} />
            <input
              type="password"
              name="password"
              placeholder={t('passwordPlaceholder') ?? ''}
              className={styles.signinInput}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder={t('confirmPlaceholder') ?? ''}
              className={styles.signinInput}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <button type="submit" className={styles.signinButton}>
              {t('button')}
            </button>
          </form>
        </>
      ) : (
        <Text as="p">{t('missingToken')}</Text>
      )}
      <Link href="/signin" className={styles.signinLink}>
        {t('signInLink')}
      </Link>
    </Flex>
  );
}
