import { screen, render, fireEvent } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import VolunteerFilters from '.';

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

describe('VolunteerFilters', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/volunteers');
  });

  test.each<{ filters: (keyof UserFilters)[] }>([
    { filters: [] },
    { filters: ['searchQuery'] },
    { filters: ['roleType'] },
    { filters: ['showDeleted'] },
    { filters: ['searchQuery', 'roleType'] },
    { filters: ['searchQuery', 'showDeleted'] },
    { filters: ['roleType', 'showDeleted'] },
    { filters: ['searchQuery', 'roleType', 'showDeleted'] }
  ])('renders the correct filters for $filters', ({ filters }) => {
    render(<VolunteerFilters withFilters={filters} />);
    if (filters.includes('searchQuery')) {
      expect(screen.getByPlaceholderText('placeholder')).toBeInTheDocument();
    } else {
      expect(screen.queryByPlaceholderText('placeholder')).not.toBeInTheDocument();
    }
    if (filters.some((f) => f !== 'searchQuery')) {
      expect(screen.getByRole('button', { name: 'filters' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'filters' }));
      if (filters.includes('roleType')) {
        fireEvent.click(screen.getByRole('combobox'));
        expect(screen.getByRole('option', { name: 'allRoles' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'admin' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'organiser' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'teamLead' })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      }
      if (filters.includes('showDeleted')) {
        expect(screen.getByLabelText('showDeleted')).toBeInTheDocument();
      } else {
        expect(screen.queryByLabelText('showDeleted')).not.toBeInTheDocument();
      }
    } else {
      expect(screen.queryByRole('button', { name: 'filters' })).not.toBeInTheDocument();
    }
  });

  it('toggles the filter panel when the filter button is clicked', () => {
    render(<VolunteerFilters withFilters={['roleType']} />);
    const filterButton = screen.getByRole('button', { name: 'filters' });

    expect(screen.queryByText('allRoles')).not.toBeInTheDocument();
    fireEvent.click(filterButton);
    expect(screen.queryByText('allRoles')).toBeInTheDocument();
    fireEvent.click(filterButton);
    expect(screen.queryByText('allRoles')).not.toBeInTheDocument();
  });

  it('calls onFilterChange when a filter value is changed', async () => {
    render(<VolunteerFilters withFilters={['roleType']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'filters' }));

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    fireEvent.click(screen.getByRole('option', { name: 'admin' }));

    expect(window.location.search).toContain('roleType=admin');
  });

  it('clears all filters when the clear button is clicked', async () => {
    render(<VolunteerFilters withFilters={['roleType', 'showDeleted']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'filters' }));

    const clearButton = screen.getByRole('button', { name: 'clear' });
    await user.click(clearButton);

    expect(window.location.search).toBe('');
  });

  it('renders the checkbox for "showDeleted" filter and toggles its state', async () => {
    const { rerender } = render(<VolunteerFilters withFilters={['showDeleted']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'filters' }));
    expect(screen.getByLabelText('showDeleted')).not.toBeChecked();
    await user.click(screen.getByLabelText('showDeleted'));
    expect(window.location.search).toContain('showDeleted=true');
    // rerender is required to update searchParams after the URL change
    rerender(<VolunteerFilters withFilters={['showDeleted']} />);
    await user.click(screen.getByLabelText('showDeleted'));
    expect(window.location.search).not.toContain('showDeleted=true');
  });
});
