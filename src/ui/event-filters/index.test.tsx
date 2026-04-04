import { screen, render, fireEvent } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import EventFilters from '.';

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
  usePathname: jest.fn(() => '/events')
}));

describe('EventFilters', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/events');
  });

  test.each<{ filters: (keyof EventFilters)[] }>([
    { filters: [] },
    { filters: ['searchQuery'] },
    { filters: ['showArchived'] },
    { filters: ['searchQuery', 'showArchived'] }
  ])('renders the correct filters for $filters', ({ filters }) => {
    render(<EventFilters withFilters={filters} />);
    if (filters.includes('searchQuery')) {
      expect(screen.getByPlaceholderText('placeholder')).toBeInTheDocument();
    } else {
      expect(screen.queryByPlaceholderText('placeholder')).not.toBeInTheDocument();
    }
    if (filters.some((f) => f !== 'searchQuery')) {
      expect(screen.getByRole('button', { name: 'filters' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'filters' }));
      if (filters.includes('showArchived')) {
        expect(screen.getByLabelText('showArchived')).toBeInTheDocument();
      } else {
        expect(screen.queryByLabelText('showArchived')).not.toBeInTheDocument();
      }
    } else {
      expect(screen.queryByRole('button', { name: 'filters' })).not.toBeInTheDocument();
    }
  });

  it('calls onFilterChange when a filter value is changed', async () => {
    render(<EventFilters withFilters={['showArchived']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'filters' }));

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(window.location.search).toContain('showArchived=true');
  });

  it('clears all filters when the clear button is clicked', async () => {
    render(<EventFilters withFilters={['showArchived']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'filters' }));

    const clearButton = screen.getByRole('button', { name: 'clear' });
    await user.click(clearButton);

    expect(window.location.search).toBe('');
  });

  it('renders the checkbox for "showArchived" filter and toggles its state', async () => {
    const { rerender } = render(<EventFilters withFilters={['showArchived']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'filters' }));
    expect(screen.getByLabelText('showArchived')).not.toBeChecked();
    await user.click(screen.getByLabelText('showArchived'));
    expect(window.location.search).toContain('showArchived=true');
    // rerender is required to update searchParams after the URL change
    rerender(<EventFilters withFilters={['showArchived']} />);
    await user.click(screen.getByLabelText('showArchived'));
    expect(window.location.search).not.toContain('showArchived=true');
  });
});
