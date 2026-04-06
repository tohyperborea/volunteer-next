import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SignInPage from './page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

jest.mock('@/auth', () => ({
  AUTH_MODE: 'oauth',
  auth: {
    api: {
      signInWithOAuth2: jest.fn()
    }
  }
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      button: 'Sign In with Pretix',
      descriptionOne: 'Sign in to your account to continue.',
      descriptionTwo: 'We use our ticket system, Pretix, to provide a single sign-on experience.',
      descriptionThree: 'Clicking the button below will redirect you to the Pretix login page.',
      descriptionFour: 'After logging in, you will be redirected back to this application.'
    };
    return translations[key] || key;
  }
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key: string, values: Record<string, string> = {}) => {
      const translations: Record<string, string> = {
        title: 'Sign In',
        signInToAccount: 'Sign in to your account to continue.',
        useOAuth: `We use our ticket system, ${values.provider}, to provide a single sign-on experience.`,
        clickButtonToRedirect: `Clicking the button below will redirect you to the ${values.provider} login page.`,
        afterLoggingIn: 'After logging in, you will be redirected back to this application.',
        button: `Sign In with ${values.provider}`,
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        buttonCredentials: 'Sign In',
        createAccount: 'Create an account',
        forgotPassword: 'Forgot password?',
        forgotDescription: "Enter your email and we'll send you a link to reset your password.",
        forgotButton: 'Send reset link',
        forgotSuccessMessage:
          "If an account exists for that email, we've sent a reset link. Check your inbox.",
        backToSignIn: 'Back to sign in',
        invalidCredentialsTitle: 'Sign in failed',
        invalidCredentials: 'Invalid email or password. Please try again.',
        tooManyAttemptsTitle: 'Too many attempts',
        tooManyAttempts: 'Too many failed sign-in attempts. Please try again in 15 minutes.',
        rateLimitError: 'Too many requests from your connection. Please try again later.',
        errorDialogClose: 'OK'
      };
      return translations[key as string] || key;
    })
  )
}));

jest.mock('./styles.module.css', () => ({
  signinContainerOuter: 'signinContainerOuter',
  signinForm: 'signinForm',
  signinButton: 'signinButton',
  signinInput: 'signinInput',
  signinLinks: 'signinLinks',
  signinLink: 'signinLink'
}));

describe('SignInPage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      OAUTH_PROVIDER_ID: 'test-provider-id',
      OAUTH_PROVIDER_NAME: 'Pretix'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders the sign-in button', async () => {
    const Component = await SignInPage({ searchParams: Promise.resolve({}) });
    render(Component);
    const signInButton = screen.getByRole('button', { name: /sign in with pretix/i });
    expect(signInButton).toBeInTheDocument();
  });

  it('renders all description items', async () => {
    const Component = await SignInPage({ searchParams: Promise.resolve({}) });
    render(Component);

    expect(screen.getByText('Sign in to your account to continue.')).toBeInTheDocument();
    expect(
      screen.getByText('We use our ticket system, Pretix, to provide a single sign-on experience.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Clicking the button below will redirect you to the Pretix login page.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('After logging in, you will be redirected back to this application.')
    ).toBeInTheDocument();
  });

  it('renders the form with correct structure', async () => {
    const Component = await SignInPage({ searchParams: Promise.resolve({}) });
    render(Component);

    const form = screen.getByRole('button').closest('form');
    expect(form).toBeInTheDocument();
  });

  it('has the sign-in button as a submit button', async () => {
    const Component = await SignInPage({ searchParams: Promise.resolve({}) });
    render(Component);

    const signInButton = screen.getByRole('button', { name: /sign in with pretix/i });
    expect(signInButton).toHaveAttribute('type', 'submit');
  });
});
