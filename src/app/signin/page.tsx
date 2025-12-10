import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Flex, Heading, Text } from '@radix-ui/themes';
import styles from './styles.module.css';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || '/';

  const signin = async (formData: FormData) => {
    'use server';
    // Get callbackUrl from form data (passed as hidden input) or default to '/'
    const url = (formData.get('callbackUrl') as string) || '/';
    const data = await auth.api.signInWithOAuth2({
      body: {
        providerId: process.env.OAUTH_PROVIDER_ID ?? '',
        callbackURL: url,
        scopes: ['openid', 'email', 'profile']
      }
    });
    if (data.redirect) {
      redirect(data.url);
    }
  };
  const t = await getTranslations('SignInPage');
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      <form action={signin} className={styles.signinForm}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button type="submit" className={styles.signinButton}>
          {t('button')}
        </button>
      </form>
      <Text style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
        <li>
          <Text as="span">{t('descriptionOne')}</Text>
        </li>
        <li>
          <Text as="span">{t('descriptionTwo')}</Text>
        </li>
        <li>
          <Text as="span">{t('descriptionThree')}</Text>
        </li>
        <li>
          <Text as="span">{t('descriptionFour')}</Text>
        </li>
      </Text>
    </Flex>
  );
}
