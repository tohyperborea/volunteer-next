import { render } from '@testing-library/react';
import TeamFilters from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({
    push: jest.fn((url: string) => {
      window.history.pushState({}, '', url);
    }),
    replace: jest.fn((url: string) => {
      window.history.replaceState({}, '', url);
    }),
    prefetch: jest.fn()
  }),
  usePathname: jest.fn(() => '/volunteers')
}));

jest.mock('@/ui/search-bar', () => jest.fn(() => <div data-testid="search-bar" />));

describe('TeamFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search bar when "searchQuery" filter is provided', () => {
    const { getByTestId } = render(<TeamFilters withFilters={['searchQuery']} />);

    expect(getByTestId('search-bar')).toBeInTheDocument();
  });

  it('does not render the filter panel button when no additional filters are provided', () => {
    const { queryByRole } = render(<TeamFilters withFilters={['searchQuery']} />);

    expect(queryByRole('button', { name: /filters/i })).not.toBeInTheDocument();
  });
});
