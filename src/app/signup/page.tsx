import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import styles from '../signin/styles.module.css';

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  if (AUTH_MODE !== 'credentials') {
    redirect('/signin');
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl || '/';

  const signUp = async (formData: FormData) => {
    'use server';
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const url = (formData.get('callbackUrl') as string) || '/';
    if (!name || !email || !password) return;
    await auth.api.signUpEmail({
      body: { name, email, password, callbackURL: url }
    });
    redirect(url);
  };

  const t = await getTranslations('SignUpPage');
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      <Text as="p">{t('description')}</Text>
      <form action={signUp} className={styles.signinForm}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />
        <input
          type="text"
          name="name"
          placeholder={t('namePlaceholder') ?? ''}
          className={styles.signinInput}
          autoComplete="name"
          required
        />
        <input
          type="email"
          name="email"
          placeholder={t('emailPlaceholder') ?? ''}
          className={styles.signinInput}
          autoComplete="email"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={t('passwordPlaceholder') ?? ''}
          className={styles.signinInput}
          autoComplete="new-password"
          required
        />
        <button type="submit" className={styles.signinButton}>
          {t('button')}
        </button>
        <Link href={`/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className={styles.signinLink}>
          {t('signInLink')}
        </Link>
      </form>
    </Flex>
  );
}
