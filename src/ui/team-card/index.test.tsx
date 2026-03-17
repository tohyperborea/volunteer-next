import { render, screen } from '@testing-library/react';
import TeamCard from '.';
import ProgressBar from '../progress-bar';
import { getTeamInfoPath } from '@/utils/path';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/utils/path', () => ({
  getTeamInfoPath: jest.fn().mockReturnValue(`team-info-path`)
}));
jest.mock('@/ui/progress-bar', () => jest.fn().mockReturnValue(<div data-testid="progress-bar" />));

const mockProgressBar = ProgressBar as jest.MockedFunction<typeof ProgressBar>;
const mockGetTeamInfoPath = getTeamInfoPath as jest.MockedFunction<typeof getTeamInfoPath>;

describe('TeamCard', () => {
  it('renders team name and description', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid'
    };
    const shifts: ShiftInfo[] = [];
    const eventSlug = 'event-2025';

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Description A')).toBeInTheDocument();
  });

  it('renders a link to the team info page', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid'
    };
    const shifts: ShiftInfo[] = [];
    const eventSlug = 'event-2025';

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} />);

    expect(mockGetTeamInfoPath).toHaveBeenCalledWith(eventSlug, team.slug);
    const link = screen.getByRole('link', { name: /team a/i });
    expect(link).toHaveAttribute('href', 'team-info-path');
  });

  it('renders the progress bar with correct values', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid'
    };
    const shifts: ShiftInfo[] = [
      {
        maxVolunteers: 5,
        id: '',
        teamId: '',
        isActive: true,
        title: '',
        eventDay: 0,
        startTime: '',
        durationHours: 0,
        minVolunteers: 0
      },
      {
        maxVolunteers: 10,
        id: '',
        teamId: '',
        isActive: true,
        title: '',
        eventDay: 0,
        startTime: '',
        durationHours: 0,
        minVolunteers: 0
      }
    ];
    const eventSlug = 'event-2025';

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} />);

    expect(mockProgressBar).toHaveBeenCalledWith(
      expect.objectContaining({
        filled: 0,
        total: 15
      }),
      undefined
    );
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('renders actions if provided', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid'
    };
    const shifts: ShiftInfo[] = [];
    const eventSlug = 'event-2025';
    const actions = <button>Action</button>;

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} actions={actions} />);

    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('renders collapsible volunteer names', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid'
    };
    const shifts: ShiftInfo[] = [];
    const eventSlug = 'event-2025';

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} />);

    expect(screen.getByText('volunteers')).toBeInTheDocument();
  });
});
