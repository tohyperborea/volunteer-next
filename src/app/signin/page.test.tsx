import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import SignInPage from './page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

jest.mock('@/auth', () => ({
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
    Promise.resolve((key: string) => {
      const translations: Record<string, string> = {
        title: 'Sign In',
        button: 'Sign In with Pretix',
        descriptionOne: 'Sign in to your account to continue.',
        descriptionTwo: 'We use our ticket system, Pretix, to provide a single sign-on experience.',
        descriptionThree: 'Clicking the button below will redirect you to the Pretix login page.',
        descriptionFour: 'After logging in, you will be redirected back to this application.'
      };
      return translations[key] || key;
    })
  )
}));

jest.mock('./styles.module.css', () => ({
  signinContainerOuter: 'signinContainerOuter',
  signinForm: 'signinForm',
  signinButton: 'signinButton'
}));

describe('SignInPage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      OAUTH_PROVIDER_ID: 'test-provider-id'
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
