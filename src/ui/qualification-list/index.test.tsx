import { fireEvent, render, screen } from '@testing-library/react';
import QualificationList from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

const mockEvent = {
  id: 'event1',
  name: 'Event 1',
  slug: 'event1',
  startDate: new Date(),
  endDate: new Date()
};

describe('QualificationList', () => {
  it('renders the component with qualifications', () => {
    const mockQualifications = [
      {
        id: '1',
        eventId: 'event1',
        teamId: 'team1',
        name: 'Qualification 1',
        errorMessage: 'error'
      },
      {
        id: '2',
        eventId: 'event1',
        teamId: 'team2',
        name: 'Qualification 2',
        errorMessage: 'error'
      }
    ];

    const mockTeams = [
      { id: 'team1', eventId: 'event1', slug: 'team1', name: 'Team 1', description: 'description' },
      { id: 'team2', eventId: 'event1', slug: 'team2', name: 'Team 2', description: 'description' }
    ];

    render(
      <QualificationList qualifications={mockQualifications} event={mockEvent} teams={mockTeams} />
    );

    expect(screen.getByText('Qualification 1')).toBeInTheDocument();
    expect(screen.getByText('Qualification 2')).toBeInTheDocument();
  });

  it('renders the add button when onSave is provided', () => {
    const mockQualifications: QualificationInfo[] = [];
    const mockTeams: TeamInfo[] = [];
    const mockOnSave = jest.fn();

    render(
      <QualificationList
        qualifications={mockQualifications}
        event={mockEvent}
        teams={mockTeams}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('add')).toBeInTheDocument();
  });

  it('does not render the add button when onSave is not provided', () => {
    const mockQualifications: QualificationInfo[] = [];
    const mockTeams: TeamInfo[] = [];

    render(
      <QualificationList qualifications={mockQualifications} event={mockEvent} teams={mockTeams} />
    );

    expect(screen.queryByText('add')).not.toBeInTheDocument();
  });

  it('opens the QualificationDialog when the add button is clicked', () => {
    const mockQualifications: QualificationInfo[] = [];
    const mockTeams: TeamInfo[] = [];
    const mockOnSave = jest.fn();

    render(
      <QualificationList
        qualifications={mockQualifications}
        event={mockEvent}
        teams={mockTeams}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('add'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the correct team names for qualifications', () => {
    const mockQualifications = [
      {
        id: '1',
        eventId: 'event1',
        teamId: 'team1',
        name: 'Qualification 1',
        errorMessage: 'error'
      }
    ];
    const mockTeams = [
      { id: 'team1', eventId: 'event1', name: 'Team 1', slug: 'team1', description: 'description' }
    ];

    render(
      <QualificationList qualifications={mockQualifications} event={mockEvent} teams={mockTeams} />
    );

    expect(screen.getByText('Team 1')).toBeInTheDocument();
  });
});
