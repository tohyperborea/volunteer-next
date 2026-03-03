import { render, screen, fireEvent } from '@testing-library/react';
import QualificationCard from './index';
import { getQualificationDetailsPath } from '@/utils/path';

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

  it('renders the edit button and calls onEdit when clicked', () => {
    const onEditMock = jest.fn();

    render(
      <QualificationCard qualification={mockQualification} event={mockEvent} onEdit={onEditMock} />
    );

    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('renders as a link when asLink is true', () => {
    (getQualificationDetailsPath as jest.Mock).mockReturnValue('/qualification-details');

    render(<QualificationCard qualification={mockQualification} event={mockEvent} asLink />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/qualification-details');
  });

  it('does not render the edit button if onEdit is not provided', () => {
    render(<QualificationCard qualification={mockQualification} event={mockEvent} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
