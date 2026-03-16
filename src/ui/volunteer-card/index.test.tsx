import { render, screen } from '@testing-library/react';
import VolunteerCard from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('VolunteerCard', () => {
  const mocks: VolunteerInfo[] = [
    {
      id: 'user-1',
      displayName: 'John D.',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      roles: []
    },
    {
      id: 'user-2',
      displayName: 'Scooby'
    },
    {
      id: 'user-3',
      displayName: 'Jane S.',
      email: 'jane@example.com'
    }
  ];

  test.each<VolunteerInfo>(mocks)('renders fields based on volunteer info', (v) => {
    render(<VolunteerCard volunteer={v} />);
    expect(screen.getByText(v.displayName)).toBeInTheDocument();
    v.email && expect(screen.getByText(v.email)).toBeInTheDocument();
    v.fullName && expect(screen.getByText(v.fullName)).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const mockActions = <button>Click Me</button>;
    render(<VolunteerCard volunteer={mocks[0]} actions={mockActions} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('does not render actions when not provided', () => {
    render(<VolunteerCard volunteer={mocks[0]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
