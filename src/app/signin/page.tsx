import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Flex, Text } from '@radix-ui/themes';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const signin = async () => {
    'use server';
    const data = await auth.api.signInWithOAuth2({
      body: {
        providerId: process.env.OAUTH_PROVIDER_ID ?? '',
        callbackURL: '/',
        scopes: ['openid', 'email', 'profile']
      }
    });
    if (data.redirect) {
      redirect(data.url);
    }
  };
  const t = useTranslations('SignInPage');
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <form action={signin} className={styles.signinForm}>
        <button type="submit" className={styles.signinButton}>
          {t('button')}
        </button>
      </form>
      <Text style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
        <li>{t('descriptionOne')}</li>
        <li>{t('descriptionTwo')}</li>
        <li>{t('descriptionThree')}</li>
        <li>{t('descriptionFour')}</li>
      </Text>
    </Flex>
  );
}
