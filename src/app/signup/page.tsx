import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Heading, Text, TextField } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { VisuallyHidden } from '@radix-ui/themes';
import {
  isValidEmail,
  validatePassword,
  validateName,
  getSafeCallbackUrl
} from '@/lib/signup-validation';
import { checkRateLimit, AUTH_ENDPOINT_LIMITS } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/client-ip';
import SigninContainer from '@/ui/signin-container';

type SearchParams = {
  callbackUrl?: string;
  errorName?: string;
  errorEmail?: string;
  errorPassword?: string;
  errorAccount?: string;
  error?: string;
};

function buildSignupSearchParams(
  safeCallbackUrl: string,
  errors: {
    name?: string;
    email?: string;
    password?: string;
    account?: string;
    rateLimit?: boolean;
  }
): string {
  const p = new URLSearchParams();
  if (safeCallbackUrl !== '/') p.set('callbackUrl', safeCallbackUrl);
  if (errors.name) p.set('errorName', errors.name);
  if (errors.email) p.set('errorEmail', errors.email);
  if (errors.password) p.set('errorPassword', errors.password);
  if (errors.account) p.set('errorAccount', errors.account);
  if (errors.rateLimit) p.set('error', 'rate_limit');
  const s = p.toString();
  return s ? `?${s}` : '';
}

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (AUTH_MODE !== 'credentials') {
    redirect('/signin');
  }

  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  const signUp = async (formData: FormData) => {
    'use server';
    const ip = await getClientIp();
    if (!checkRateLimit(ip, AUTH_ENDPOINT_LIMITS.signup)) {
      const rawUrl = formData.get('callbackUrl') as string | null;
      const url = getSafeCallbackUrl(rawUrl);
      redirect(`/signup${buildSignupSearchParams(url, { rateLimit: true })}`);
    }
    const name = (formData.get('name') as string)?.trim() ?? '';
    const email = (formData.get('email') as string)?.trim() ?? '';
    const password = (formData.get('password') as string) ?? '';
    const rawUrl = formData.get('callbackUrl') as string | null;
    const url = getSafeCallbackUrl(rawUrl);

    const nameResult = validateName(name);
    if (!nameResult.valid) {
      redirect(`/signup${buildSignupSearchParams(url, { name: nameResult.error })}`);
    }
    if (!isValidEmail(email)) {
      redirect(`/signup${buildSignupSearchParams(url, { email: 'invalid' })}`);
    }
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      redirect(`/signup${buildSignupSearchParams(url, { password: passwordResult.error })}`);
    }

    try {
      await auth.api.signUpEmail({
        body: { name, email, password, callbackURL: url }
      });
      redirect(url);
    } catch (err: unknown) {
      const msg = String((err as { message?: string }).message ?? '');
      const isDuplicate =
        (err as { code?: string }).code === 'USER_ALREADY_EXISTS' ||
        msg.toLowerCase().includes('already exists') ||
        (err as { statusCode?: number }).statusCode === 409;
      if (isDuplicate) {
        redirect(`/signup${buildSignupSearchParams(url, { account: 'exists' })}`);
      }
      throw err;
    }
  };

  const t = await getTranslations('SignUpPage');
  const errorName = params.errorName;
  const errorEmail = params.errorEmail;
  const errorPassword = params.errorPassword;
  const errorAccount = params.errorAccount;
  const rateLimited = params.error === 'rate_limit';

  return (
    <SigninContainer>
      <VisuallyHidden>
        <Heading>{t('title')}</Heading>
      </VisuallyHidden>
      <Text as="p">{t('description')}</Text>
      {rateLimited && (
        <Text as="p" color="red" size="1">
          {t('rateLimitError')}
        </Text>
      )}
      {errorAccount && (
        <Text as="p" color="red" size="1">
          {t(`errorAccount_${errorAccount}`)}
        </Text>
      )}
      <form
        action={signUp}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <TextField.Root
            name="name"
            placeholder={t('namePlaceholder') ?? ''}
            autoComplete="name"
            required
            maxLength={255}
            aria-invalid={!!errorName}
            aria-describedby={errorName ? 'name-error' : undefined}
          />
          {errorName && (
            <Text id="name-error" as="p" color="red" size="1">
              {t(`errorName_${errorName}`)}
            </Text>
          )}
        </div>
        <div>
          <TextField.Root
            name="email"
            type="email"
            placeholder={t('emailPlaceholder') ?? ''}
            autoComplete="email"
            required
            aria-invalid={!!errorEmail}
            aria-describedby={errorEmail ? 'email-error' : undefined}
          />
          {errorEmail && (
            <Text id="email-error" as="p" color="red" size="1">
              {t(`errorEmail_${errorEmail}`)}
            </Text>
          )}
        </div>
        <div>
          <TextField.Root
            name="password"
            type="password"
            placeholder={t('passwordPlaceholder') ?? ''}
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={!!errorPassword}
            aria-describedby={errorPassword ? 'password-error' : undefined}
          />
          {errorPassword && (
            <Text id="password-error" as="p" color="red" size="1">
              {t(`errorPassword_${errorPassword}`)}
            </Text>
          )}
        </div>
        <Button type="submit">{t('button')}</Button>
        <Link
          href={`/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
        >
          {t('signInLink')}
        </Link>
      </form>
    </SigninContainer>
  );
}
