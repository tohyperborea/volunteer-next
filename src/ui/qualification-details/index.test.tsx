import { render, screen, fireEvent } from '@testing-library/react';
import QualificationDetails from './index';
import QualificationCard from '../qualification-card';
import QualificationDialog from '../qualification-dialog';
import DeleteButton from '@/ui/delete-button';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('../qualification-card', () => jest.fn(() => <div>Mocked QualificationCard</div>));
jest.mock('../qualification-dialog', () => jest.fn(() => <div>Mocked QualificationDialog</div>));
jest.mock('@/ui/delete-button', () => jest.fn(() => <div data-testid="delete-button"></div>));

describe('QualificationDetails', () => {
  const mockQualification = {
    id: '1',
    eventId: 'event1',
    teamId: 'team1',
    name: 'Qualification Name',
    errorMessage: 'Error Message'
  };

  const mockEvent = {
    id: 'event1',
    name: 'Event Name',
    slug: 'event1',
    startDate: new Date('2030-01-01'),
    endDate: new Date('2030-01-05')
  };

  const mockTeams = [
    { id: 'team1', eventId: 'event1', slug: 'team1', description: 'Description', name: 'Team One' },
    { id: 'team2', eventId: 'event1', slug: 'team2', description: 'Description', name: 'Team Two' }
  ];

  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const mockDeleteButton = DeleteButton as jest.MockedFunction<typeof DeleteButton>;

  it('renders QualificationCard with correct props', () => {
    render(
      <QualificationDetails qualification={mockQualification} event={mockEvent} teams={mockTeams} />
    );

    expect(QualificationCard).toHaveBeenCalledWith(
      expect.objectContaining({
        qualification: mockQualification,
        event: mockEvent,
        teamName: 'Team One'
      }),
      undefined
    );
  });

  it('renders delete button when onDelete is provided', () => {
    render(
      <QualificationDetails
        qualification={mockQualification}
        event={mockEvent}
        teams={mockTeams}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    expect(mockDeleteButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onDelete: mockOnDelete
      }),
      undefined
    );
  });

  it('does not render delete button when onDelete is not provided', () => {
    render(
      <QualificationDetails qualification={mockQualification} event={mockEvent} teams={mockTeams} />
    );

    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('renders QualificationDialog when canEdit is true', () => {
    render(
      <QualificationDetails
        qualification={mockQualification}
        event={mockEvent}
        teams={mockTeams}
        onSave={mockOnSave}
      />
    );

    expect(QualificationDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: mockEvent.id,
        teams: mockTeams,
        editing: undefined
      }),
      undefined
    );
  });

  it('opens QualificationDialog when edit button is clicked', () => {
    render(
      <QualificationDetails
        qualification={mockQualification}
        event={mockEvent}
        teams={mockTeams}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('Mocked QualificationCard'));
    expect(QualificationDialog).toHaveBeenCalled();
  });

  it('does not render QualificationDialog when canEdit is false', () => {
    render(
      <QualificationDetails qualification={mockQualification} event={mockEvent} teams={mockTeams} />
    );

    expect(screen.queryByText('Mocked QualificationDialog')).not.toBeInTheDocument();
  });
});
