import { screen, render } from '@testing-library/react';
import VolunteerList from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/ui/volunteer-filters', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="volunteer-filters"></div>)
}));

describe('VolunteerList', () => {
  const mockVolunteers: VolunteerInfo[] = [
    { id: '1', displayName: 'John Doe' },
    { id: '2', displayName: 'Jane Smith' }
  ];

  it('renders a list of volunteers', () => {
    render(<VolunteerList volunteers={mockVolunteers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders a message when the volunteer list is empty', () => {
    render(<VolunteerList volunteers={[]} />);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('renders filters when withFilters prop is provided', () => {
    render(<VolunteerList volunteers={[]} withFilters={['searchQuery']} />);
    expect(screen.getByTestId('volunteer-filters')).toBeInTheDocument();
  });

  it('renders item actions for each volunteer', () => {
    const mockActions = {
      [mockVolunteers[0].id]: <button>Action 1</button>,
      [mockVolunteers[1].id]: <button>Action 2</button>
    };
    render(<VolunteerList volunteers={mockVolunteers} itemActions={mockActions} />);

    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });
});
