import { render, screen } from '@testing-library/react';
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

    const mockTeams: TeamInfo[] = [
      {
        id: 'team1',
        eventId: 'event1',
        slug: 'team1',
        name: 'Team 1',
        description: 'description',
        contactAddress: ''
      },
      {
        id: 'team2',
        eventId: 'event1',
        slug: 'team2',
        name: 'Team 2',
        description: 'description',
        contactAddress: ''
      }
    ];

    render(
      <QualificationList
        qualifications={mockQualifications}
        events={[mockEvent]}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('Qualification 1')).toBeInTheDocument();
    expect(screen.getByText('Qualification 2')).toBeInTheDocument();
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
      {
        id: 'team1',
        eventId: 'event1',
        name: 'Team 1',
        slug: 'team1',
        description: 'description',
        contactAddress: ''
      }
    ];

    render(
      <QualificationList
        qualifications={mockQualifications}
        events={[mockEvent]}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('Team 1')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
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
      {
        id: 'team1',
        eventId: 'event1',
        name: 'Team 1',
        slug: 'team1',
        description: 'description',
        contactAddress: ''
      }
    ];

    render(
      <QualificationList
        qualifications={mockQualifications}
        events={[mockEvent]}
        teams={mockTeams}
        itemActions={() => <div data-testid="test-action">Test Action</div>}
      />
    );

    expect(screen.getByTestId('test-action')).toBeInTheDocument();
  });
});
