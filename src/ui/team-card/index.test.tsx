import { render, screen } from '@testing-library/react';
import TeamCard from '.';
import ProgressBar from '../progress-bar';
import { getTeamShiftsPath } from '@/utils/path';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/utils/path', () => ({
  getTeamShiftsPath: jest.fn().mockReturnValue(`team-shifts-path`)
}));
jest.mock('@/ui/progress-bar', () => jest.fn().mockReturnValue(<div data-testid="progress-bar" />));

const mockProgressBar = ProgressBar as jest.MockedFunction<typeof ProgressBar>;
const mockGetTeamShiftsPath = getTeamShiftsPath as jest.MockedFunction<typeof getTeamShiftsPath>;

describe('TeamCard', () => {
  it('renders team name and description', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid',
      contactAddress: ''
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
      eventId: 'eventid',
      contactAddress: ''
    };
    const shifts: ShiftInfo[] = [];
    const eventSlug = 'event-2025';

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} />);

    expect(getTeamShiftsPath).toHaveBeenCalledWith(eventSlug, team.slug);
    const link = screen.getByRole('link', { name: /team a/i });
    expect(link).toHaveAttribute('href', 'team-shifts-path');
  });

  it('renders the progress bar with correct values', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid',
      contactAddress: ''
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
        filled: 15,
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
      eventId: 'eventid',
      contactAddress: ''
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
      eventId: 'eventid',
      contactAddress: ''
    };
    const shifts: ShiftInfo[] = [
      {
        id: 'shift1',
        teamId: 'teamid',
        title: 'Shift 1',
        eventDay: 0,
        startTime: '',
        durationHours: 0,
        isActive: true,
        maxVolunteers: 5,
        minVolunteers: 0
      }
    ];
    const eventSlug = 'event-2025';
    const volunteers: Record<ShiftId, VolunteerInfo[]> = {
      shift1: [
        { id: 'vol1', displayName: 'Volunteer 1' },
        { id: 'vol2', displayName: 'Volunteer 2' }
      ]
    };

    render(
      <TeamCard team={team} shifts={shifts} eventSlug={eventSlug} shiftVolunteers={volunteers} />
    );

    expect(screen.getByText('volunteers')).toBeInTheDocument();
  });

  it('renders a signup button if showSignup is true and there are open shifts', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid',
      contactAddress: ''
    };
    const shifts: ShiftInfo[] = [
      {
        id: 'shift1',
        teamId: 'teamid',
        title: 'Shift 1',
        eventDay: 0,
        startTime: '',
        durationHours: 0,
        isActive: true,
        maxVolunteers: 5,
        minVolunteers: 0
      }
    ];
    const eventSlug = 'event-2025';

    render(<TeamCard team={team} shifts={shifts} eventSlug={eventSlug} showSignup />);

    const signupLink = screen.getByRole('link', { name: /signup/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', 'team-shifts-path');
  });

  it('disables the signup button if all shifts are full', () => {
    const team: TeamInfo = {
      name: 'Team A',
      description: 'Description A',
      slug: 'team-a',
      id: 'teamid',
      eventId: 'eventid',
      contactAddress: ''
    };
    const shifts: ShiftInfo[] = [
      {
        id: 'shift1',
        teamId: 'teamid',
        title: 'Shift 1',
        eventDay: 0,
        startTime: '',
        durationHours: 0,
        isActive: true,
        maxVolunteers: 5,
        minVolunteers: 0
      }
    ];
    const eventSlug = 'event-2025';
    const volunteers: Record<ShiftId, VolunteerInfo[]> = {
      shift1: [
        { id: 'vol1', displayName: 'Volunteer 1' },
        { id: 'vol2', displayName: 'Volunteer 2' },
        { id: 'vol3', displayName: 'Volunteer 3' },
        { id: 'vol4', displayName: 'Volunteer 4' },
        { id: 'vol5', displayName: 'Volunteer 5' }
      ]
    };

    render(
      <TeamCard
        team={team}
        shifts={shifts}
        eventSlug={eventSlug}
        shiftVolunteers={volunteers}
        showSignup
      />
    );

    const signup = screen.getByText('signup');
    expect(signup).toHaveAttribute('data-disabled', 'true');
  });
});
