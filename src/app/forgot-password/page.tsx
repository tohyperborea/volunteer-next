import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import styles from '../signin/styles.module.css';

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  if (AUTH_MODE !== 'credentials') {
    redirect('/signin');
  }

  const params = await searchParams;
  const sent = params.sent === '1';

  const requestReset = async (formData: FormData) => {
    'use server';
    const email = (formData.get('email') as string)?.trim();
    if (!email) return;
    const baseUrl = process.env.BETTER_AUTH_URL ?? '';
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${baseUrl}/reset-password`
      }
    });
    redirect('/forgot-password?sent=1');
  };

  const t = await getTranslations('ForgotPasswordPage');
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      <Text as="p">{t('description')}</Text>
      {sent ? (
        <Text as="p" size="2">
          {t('successMessage')}
        </Text>
      ) : (
        <form action={requestReset} className={styles.signinForm}>
          <input
            type="email"
            name="email"
            placeholder={t('emailPlaceholder') ?? ''}
            className={styles.signinInput}
            autoComplete="email"
            required
          />
          <button type="submit" className={styles.signinButton}>
            {t('button')}
          </button>
        </form>
      )}
      <Link href="/signin" className={styles.signinLink}>
        {t('signInLink')}
      </Link>
    </Flex>
  );
}
