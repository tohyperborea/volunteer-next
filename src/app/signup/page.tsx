import { auth, AUTH_MODE } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Flex, Heading, Text, TextField } from '@radix-ui/themes';
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
import metadata from '@/i18n/metadata';
import { validateNewUser } from '@/validator/user-validator';
import { FormField } from '@/ui/form-dialog';

const PAGE_KEY = 'SignUpPage';
export const generateMetadata = metadata(PAGE_KEY);

type SearchParams = {
  callbackUrl?: string;
  errorName?: string;
  errorChosenName?: string;
  errorEmail?: string;
  errorPassword?: string;
  errorAccount?: string;
  error?: string;
};

function buildSignupSearchParams(
  safeCallbackUrl: string,
  errors: {
    name?: string;
    chosenName?: string;
    email?: string;
    password?: string;
    account?: string;
    rateLimit?: boolean;
  }
): string {
  const p = new URLSearchParams();
  if (safeCallbackUrl !== '/') p.set('callbackUrl', safeCallbackUrl);
  if (errors.name) p.set('errorName', errors.name);
  if (errors.chosenName) p.set('errorChosenName', errors.chosenName);
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
    const { name, email, chosenName } = validateNewUser(formData);
    const password = (formData.get('password') as string) ?? '';
    const rawUrl = formData.get('callbackUrl') as string | null;
    const url = getSafeCallbackUrl(rawUrl);

    const nameResult = validateName(name);
    if (!nameResult.valid) {
      redirect(`/signup${buildSignupSearchParams(url, { name: nameResult.error })}`);
    }
    if (chosenName) {
      const chosenNameResult = validateName(chosenName);
      if (!chosenNameResult.valid) {
        redirect(`/signup${buildSignupSearchParams(url, { chosenName: chosenNameResult.error })}`);
      }
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
        body: { name, chosenName, email, password, callbackURL: url }
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

  const t = await getTranslations(PAGE_KEY);
  const errorName = params.errorName;
  const errorChosenName = params.errorChosenName;
  const errorEmail = params.errorEmail;
  const errorPassword = params.errorPassword;
  const errorAccount = params.errorAccount;
  const rateLimited = params.error === 'rate_limit';

  return (
    <Flex direction="column">
      <SigninContainer title={t('title')}>
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
        <Flex asChild direction="column" gap="4" align="center">
          <form action={signUp} style={{ width: '100%' }}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <FormField
              name={t('namePlaceholder')}
              description={t('nameDescription')}
              ariaId="legal-name-field"
            >
              <TextField.Root
                name="name"
                placeholder={t('namePlaceholder') ?? ''}
                autoComplete="name"
                required
                maxLength={255}
                aria-labelledby="legal-name-field"
                aria-invalid={!!errorName}
                aria-describedby={errorName ? 'name-error' : undefined}
              />
              {errorName && (
                <Text id="name-error" as="p" color="red" size="1">
                  {t(`errorName_${errorName}`)}
                </Text>
              )}
            </FormField>
            <FormField
              name={t('chosenNamePlaceholder')}
              description={t('chosenNameDescription')}
              ariaId="chosen-name-field"
            >
              <TextField.Root
                name="chosenName"
                placeholder={t('chosenNamePlaceholder') ?? ''}
                maxLength={255}
                aria-labelledby="chosen-name-field"
                aria-invalid={!!errorChosenName}
                aria-describedby={errorChosenName ? 'chosenName-error' : undefined}
              />
              {errorChosenName && (
                <Text id="chosenName-error" as="p" color="red" size="1">
                  {t(`errorChosenName_${errorChosenName}`)}
                </Text>
              )}
            </FormField>
            <FormField
              name={t('emailPlaceholder')}
              description={t('emailDescription')}
              ariaId="email-field"
            >
              <TextField.Root
                name="email"
                type="email"
                placeholder={t('emailPlaceholder') ?? ''}
                autoComplete="email"
                required
                aria-labelledby="email-field"
                aria-invalid={!!errorEmail}
                aria-describedby={errorEmail ? 'email-error' : undefined}
              />
              {errorEmail && (
                <Text id="email-error" as="p" color="red" size="1">
                  {t(`errorEmail_${errorEmail}`)}
                </Text>
              )}
            </FormField>
            <FormField
              name={t('passwordPlaceholder')}
              description={t('passwordDescription')}
              ariaId="password-field"
            >
              <TextField.Root
                name="password"
                type="password"
                placeholder={t('passwordPlaceholder') ?? ''}
                autoComplete="new-password"
                required
                minLength={8}
                aria-labelledby="password-field"
                aria-invalid={!!errorPassword}
                aria-describedby={errorPassword ? 'password-error' : undefined}
              />
              {errorPassword && (
                <Text id="password-error" as="p" color="red" size="1">
                  {t(`errorPassword_${errorPassword}`)}
                </Text>
              )}
            </FormField>
            <Button style={{ width: '100%' }} type="submit">
              {t('button')}
            </Button>
            <Link
              href={`/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            >
              {t('signInLink')}
            </Link>
          </form>
        </Flex>
      </SigninContainer>
    </Flex>
  );
}
