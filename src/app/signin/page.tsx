import { auth, AUTH_MODE } from '@/auth';
import { getClientIp } from '@/lib/client-ip';
import { recordFailedLogin } from '@/lib/login-security';
import { getSafeCallbackUrl } from '@/lib/signup-validation';
import { redirect } from 'next/navigation';
import { Button, Heading, Text, TextField } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import SigninContainer from '@/ui/signin-container';
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
    const url = getSafeCallbackUrl(formData.get('callbackUrl') as string | null);
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

  const signInCredentials = async (
    formData: FormData
  ): Promise<
    { ok: true } | { ok: false; reason: 'locked' | 'rate_limit' | 'invalid_credentials' }
  > => {
    'use server';
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const url = getSafeCallbackUrl(formData.get('callbackUrl') as string | null);
    if (!email || !password) return { ok: false, reason: 'invalid_credentials' };
    try {
      await auth.api.signInEmail({
        body: { email, password, callbackURL: url }
      });
      redirect(url);
      return { ok: true };
    } catch (err: unknown) {
      const status = (err as { status?: string }).status;
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (status === 'TOO_MANY_REQUESTS' || statusCode === 429) {
        const msg = (err as { body?: { message?: string } }).body?.message ?? '';
        if (msg.includes('failed attempts')) return { ok: false, reason: 'locked' };
        return { ok: false, reason: 'rate_limit' };
      }
      const ip = await getClientIp();
      recordFailedLogin(email, ip);
      return { ok: false, reason: 'invalid_credentials' };
    }
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
    <SigninContainer>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      {useOAuth ? (
        <>
          <form
            action={signInOAuth}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <TextField.Root name="callbackUrl" value={callbackUrl ?? ''} hidden readOnly />
            <Button type="submit">{t('button')}</Button>
          </form>
          <Text style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li>
              <Text as="span">{t('signInToAccount')}</Text>
            </li>
            <li>
              <Text as="span">{t('usePretix')}</Text>
            </li>
            <li>
              <Text as="span">{t('clickButtonToRedirect')}</Text>
            </li>
            <li>
              <Text as="span">{t('afterLoggingIn')}</Text>
            </li>
          </Text>
        </>
      ) : (
        <CredentialsForm
          callbackUrl={callbackUrl}
          forgotSent={forgotSent}
          signInAction={signInCredentials}
          requestResetAction={requestReset}
        />
      )}
    </SigninContainer>
  );
}
