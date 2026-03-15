import { render, screen } from '@testing-library/react';
import QualificationCard from '.';
import { getQualificationDetailsPath } from '@/utils/path';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/utils/path', () => ({
  getQualificationDetailsPath: jest.fn()
}));

describe('QualificationCard', () => {
  const mockEvent: EventInfo = {
    id: 'event-id',
    name: 'Event Name',
    slug: 'event-slug',
    startDate: new Date(),
    endDate: new Date()
  };
  const mockQualification: QualificationInfo = {
    id: 'qualification-id',
    name: 'Qualification Name',
    eventId: mockEvent.id,
    errorMessage: 'Error Message'
  };

  it('renders the card with the correct id', () => {
    render(<QualificationCard qualification={mockQualification} event={mockEvent} />);
    const card = screen.getByTestId(`qualification-card-${mockQualification.id}`);
    expect(card).toBeInTheDocument();
  });

  it('renders the qualification name and event name', () => {
    render(<QualificationCard qualification={mockQualification} event={mockEvent} />);

    expect(screen.getByRole('heading', { name: /Qualification Name/i })).toBeInTheDocument();
    expect(screen.getByText(/Event Name/i)).toBeInTheDocument();
  });

  it('renders the team name if provided', () => {
    render(
      <QualificationCard qualification={mockQualification} event={mockEvent} teamName="Team Name" />
    );

    expect(screen.getByText(/Team Name/i)).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <QualificationCard
        qualification={mockQualification}
        event={mockEvent}
        actions={<div data-testid="test-action"></div>}
      />
    );

    expect(screen.getByTestId('test-action')).toBeInTheDocument();
  });

  it('renders as a link when asLink is true', () => {
    (getQualificationDetailsPath as jest.Mock).mockReturnValue('/qualification-details');

    render(<QualificationCard qualification={mockQualification} event={mockEvent} asLink />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/qualification-details');
  });
});
