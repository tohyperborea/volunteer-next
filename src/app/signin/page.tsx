import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import { Flex, Heading, Text } from '@radix-ui/themes';
import styles from './styles.module.css';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import { CredentialsForm } from './credentials-form';

const useOAuth = AUTH_MODE === 'oauth';

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string; forgotSent?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || '/';
  const forgotSent = params.forgotSent === '1';

  const signInOAuth = async (formData: FormData) => {
    'use server';
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

  const signInCredentials = async (formData: FormData) => {
    'use server';
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const url = (formData.get('callbackUrl') as string) || '/';
    if (!email || !password) return;
    await auth.api.signInEmail({
      body: { email, password, callbackURL: url }
    });
    redirect(url);
  };

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
    redirect('/signin?forgotSent=1');
  };

  const t = await getTranslations('SignInPage');
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainerOuter}>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      {useOAuth ? (
        <>
          <form action={signInOAuth} className={styles.signinForm}>
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />
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
        </>
      ) : (
        <CredentialsForm
          callbackUrl={callbackUrl}
          forgotSent={forgotSent}
          signInAction={signInCredentials}
          requestResetAction={requestReset}
          translations={{
            descriptionOne: t('descriptionOne'),
            emailPlaceholder: t('emailPlaceholder'),
            passwordPlaceholder: t('passwordPlaceholder'),
            buttonCredentials: t('buttonCredentials'),
            createAccount: t('createAccount'),
            forgotPassword: t('forgotPassword'),
            forgotDescription: t('forgotDescription'),
            forgotButton: t('forgotButton'),
            forgotSuccessMessage: t('forgotSuccessMessage'),
            backToSignIn: t('backToSignIn'),
            invalidCredentialsTitle: t('invalidCredentialsTitle'),
            invalidCredentials: t('invalidCredentials'),
            errorDialogClose: t('errorDialogClose')
          }}
        />
      )}
    </Flex>
  );
}
