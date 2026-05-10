import { screen, fireEvent, render } from '@/test-utils';
import ShiftFilters from '.';

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

const teams = [
  { id: 'team1', name: 'Team 1' },
  { id: 'team2', name: 'Team 2' }
] as any;

describe('ShiftFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each<{ filters: (keyof ShiftFilters)[] }>([
    { filters: [] },
    { filters: ['searchQuery'] },
    { filters: ['searchQuery', 'teamId'] },
    { filters: ['teamId'] }
  ])('renders the correct filters for $filters', ({ filters }) => {
    render(<ShiftFilters withFilters={filters} teams={teams} />);
    if (filters.includes('searchQuery')) {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    } else {
      expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
    }
    if (filters.some((f) => f !== 'searchQuery')) {
      expect(screen.getByRole('button', { name: 'filters' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'filters' }));
      if (filters.includes('teamId')) {
        fireEvent.click(screen.getByRole('combobox'));
        expect(screen.getByRole('option', { name: 'allTeams' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Team 1' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Team 2' })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      }
    } else {
      expect(screen.queryByRole('button', { name: 'filters' })).not.toBeInTheDocument();
    }
  });
});
