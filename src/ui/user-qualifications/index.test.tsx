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
  const mockEvent: EventInfo = {
    id: 'event1',
    name: 'Event 1',
    slug: 'event-1',
    startDate: new Date(),
    endDate: new Date()
  };
  const mockTeams: TeamInfo[] = [
    {
      id: 'team1',
      name: 'Team 1',
      eventId: 'event1',
      slug: 'team-1',
      description: 'description',
      contactAddress: ''
    },
    {
      id: 'team2',
      name: 'Team 2',
      eventId: 'event1',
      slug: 'team-2',
      description: 'description',
      contactAddress: ''
    }
  ];

  it('renders with required props', () => {
    render(
      <UserQualifications qualifications={mockQualifications} event={mockEvent} teams={mockTeams} />
    );

    for (const qualification of mockQualifications) {
      expect(screen.getByText(qualification.name)).toBeInTheDocument();
    }
  });

  it('does not render remove button when not authorised', () => {
    render(
      <UserQualifications qualifications={mockQualifications} event={mockEvent} teams={mockTeams} />
    );

    expect(screen.queryByLabelText('remove')).not.toBeInTheDocument();
  });

  it('renders remove button for managed qualifications', () => {
    const mockOnRemove = jest.fn();

    render(
      <UserQualifications
        qualifications={mockQualifications}
        event={mockEvent}
        teams={mockTeams}
        onRemove={mockOnRemove}
        managedQualificationIds={new Set(['2'])}
      />
    );

    for (const { id } of mockQualifications) {
      if (id === '2') {
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
