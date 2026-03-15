import { render, fireEvent, screen, within } from '@testing-library/react';
import UserQualifications from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('UserQualifications', () => {
  const mockQualifications: QualificationInfo[] = [
    {
      id: '1',
      name: 'Team 1 Qualification',
      eventId: 'event1',
      teamId: 'team1',
      errorMessage: 'error'
    },
    {
      id: '2',
      name: 'Team 2 Qualification',
      eventId: 'event1',
      teamId: 'team2',
      errorMessage: 'error'
    },
    {
      id: '3',
      name: 'Event 1 Qualification',
      eventId: 'event1',
      errorMessage: 'error'
    },
    {
      id: '4',
      name: 'Event 2 Qualification',
      eventId: 'event2',
      errorMessage: 'error'
    }
  ];
  const mockEvents: EventInfo[] = [
    {
      id: 'event1',
      name: 'Event 1',
      slug: 'event-1',
      startDate: new Date(),
      endDate: new Date()
    },
    {
      id: 'event2',
      name: 'Event 2',
      slug: 'event-2',
      startDate: new Date(),
      endDate: new Date()
    }
  ];
  const mockTeams: TeamInfo[] = [
    {
      id: 'team1',
      name: 'Team 1',
      eventId: 'event1',
      slug: 'team-1',
      description: 'description'
    },
    {
      id: 'team2',
      name: 'Team 2',
      eventId: 'event1',
      slug: 'team-2',
      description: 'description'
    }
  ];

  it('renders with required props', () => {
    render(
      <UserQualifications
        qualifications={mockQualifications}
        events={mockEvents}
        teams={mockTeams}
      />
    );

    for (const qualification of mockQualifications) {
      expect(screen.getByText(qualification.name)).toBeInTheDocument();
    }
  });

  it('renders all remove buttons when fully authorised', () => {
    const mockOnRemove = jest.fn();

    render(
      <UserQualifications
        qualifications={mockQualifications}
        events={mockEvents}
        teams={mockTeams}
        onRemove={mockOnRemove}
        authorised={true}
      />
    );

    for (const { id } of mockQualifications) {
      const removeButton = within(screen.getByTestId(`qualification-card-${id}`)).getByLabelText(
        'remove'
      );
      expect(removeButton).toBeInTheDocument();

      fireEvent.click(removeButton);
      expect(mockOnRemove).toHaveBeenCalledWith(id);
    }
  });

  it('does not render remove button when not authorised', () => {
    render(
      <UserQualifications
        qualifications={mockQualifications}
        events={mockEvents}
        teams={mockTeams}
      />
    );

    expect(screen.queryByLabelText('remove')).not.toBeInTheDocument();
  });

  it('renders remove button for authorised events', () => {
    const mockOnRemove = jest.fn();

    render(
      <UserQualifications
        qualifications={mockQualifications}
        events={mockEvents}
        teams={mockTeams}
        onRemove={mockOnRemove}
        authorisedEvents={['event1']}
      />
    );

    for (const { id, eventId } of mockQualifications) {
      if (eventId === 'event1') {
        const removeButton = within(screen.getByTestId(`qualification-card-${id}`)).getByLabelText(
          'remove'
        );
        expect(removeButton).toBeInTheDocument();

        fireEvent.click(removeButton);
        expect(mockOnRemove).toHaveBeenCalledWith(id);
      } else {
        expect(
          within(screen.getByTestId(`qualification-card-${id}`)).queryByLabelText('remove')
        ).not.toBeInTheDocument();
      }
    }
  });

  it('renders remove button for authorised teams', () => {
    const mockOnRemove = jest.fn();

    render(
      <UserQualifications
        qualifications={mockQualifications}
        events={mockEvents}
        teams={mockTeams}
        onRemove={mockOnRemove}
        authorisedTeams={['team2']}
      />
    );

    for (const { id, teamId } of mockQualifications) {
      if (teamId === 'team2') {
        const removeButton = within(screen.getByTestId(`qualification-card-${id}`)).getByLabelText(
          'remove'
        );
        expect(removeButton).toBeInTheDocument();

        fireEvent.click(removeButton);
        expect(mockOnRemove).toHaveBeenCalledWith(id);
      } else {
        expect(
          within(screen.getByTestId(`qualification-card-${id}`)).queryByLabelText('remove')
        ).not.toBeInTheDocument();
      }
    }
  });
});
