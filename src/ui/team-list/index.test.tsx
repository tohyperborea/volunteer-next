import { render } from '@/test-utils';
import TeamList from '.';
import TeamCard from '../team-card';
import TeamFilters from '../team-filters';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/ui/team-card', () => jest.fn().mockReturnValue(<div data-testid="team-card"></div>));
jest.mock('@/ui/team-filters', () =>
  jest.fn().mockReturnValue(<div data-testid="team-filters"></div>)
);

const mockTeamCard = TeamCard as jest.MockedFunction<typeof TeamCard>;
const mockTeamFilters = TeamFilters as jest.MockedFunction<typeof TeamFilters>;

describe('TeamList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders no teams message when teams list is empty', () => {
    const { getByText } = render(<TeamList teams={[]} shifts={[]} shiftVolunteers={{}} />);
    expect(getByText('noTeams')).toBeInTheDocument();
  });

  it('renders a list of teams with their respective shifts', () => {
    const teams: TeamInfo[] = [
      {
        id: 'team1',
        name: 'Team 1',
        eventId: 'event1',
        slug: 'team1',
        description: 'description',
        contactAddress: ''
      },
      {
        id: 'team2',
        name: 'Team 2',
        eventId: 'even1',
        slug: 'team2',
        description: 'description',
        contactAddress: ''
      }
    ];
    const shifts: ShiftInfo[] = [
      {
        id: 'shift1',
        teamId: 'team1',
        title: 'Shift 1',
        isActive: true,
        eventDay: 0,
        startTime: '10:00',
        durationHours: 4,
        minVolunteers: 1,
        maxVolunteers: 5
      },
      {
        id: 'shift2',
        teamId: 'team2',
        title: 'Shift 2',
        isActive: true,
        eventDay: 0,
        startTime: '17:00',
        durationHours: 4,
        minVolunteers: 1,
        maxVolunteers: 5
      }
    ];
    const itemActions: Record<TeamId, React.ReactNode> = {
      team1: <button>Action 1</button>,
      team2: <button>Action 2</button>
    };
    const { getAllByTestId } = render(
      <TeamList teams={teams} shifts={shifts} itemActions={itemActions} shiftVolunteers={{}} />
    );

    expect(mockTeamCard).toHaveBeenCalledWith(
      expect.objectContaining({
        team: teams[0],
        shifts: [shifts[0]],
        actions: itemActions['team1']
      }),
      undefined
    );
    expect(mockTeamCard).toHaveBeenCalledWith(
      expect.objectContaining({
        team: teams[1],
        shifts: [shifts[1]],
        actions: itemActions['team2']
      }),
      undefined
    );

    expect(getAllByTestId('team-card')).toHaveLength(2);
  });

  it('renders TeamFilters component', () => {
    const teams: TeamInfo[] = [
      {
        id: 'team1',
        name: 'Team 1',
        eventId: 'event1',
        slug: 'team1',
        description: 'description',
        contactAddress: ''
      },
      {
        id: 'team2',
        name: 'Team 2',
        eventId: 'even1',
        slug: 'team2',
        description: 'description',
        contactAddress: ''
      }
    ];
    const { getByTestId } = render(<TeamList teams={teams} shifts={[]} shiftVolunteers={{}} />);
    expect(mockTeamFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        withFilters: ['searchQuery']
      }),
      undefined
    );
    expect(getByTestId('team-filters')).toBeInTheDocument();
  });
});
