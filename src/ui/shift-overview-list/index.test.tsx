import { render } from '@testing-library/react';
import ShiftOverviewList from '.';
import ShiftCard from '@/ui/shift-card';

jest.mock('@/ui/shift-card', () => jest.fn());

const mockShiftCard = ShiftCard as jest.MockedFunction<typeof ShiftCard>;

describe('ShiftOverviewList', () => {
  const mockEvent: EventInfo = {
    id: '',
    name: '',
    slug: '',
    startDate: new Date(),
    endDate: new Date()
  };

  const mockTeams: TeamInfo[] = [
    {
      id: 'team1',
      name: 'Team One',
      eventId: '',
      slug: '',
      description: '',
      contactAddress: ''
    },
    {
      id: 'team2',
      name: 'Team Two',
      eventId: '',
      slug: '',
      description: '',
      contactAddress: ''
    }
  ];

  const mockShifts: ShiftInfo[] = [
    {
      id: 'shift1',
      eventDay: 1,
      teamId: 'team1',
      isActive: true,
      title: '',
      startTime: '',
      durationHours: 0,
      minVolunteers: 0,
      maxVolunteers: 0,
      requirements: []
    },
    {
      id: 'shift2',
      eventDay: 1,
      teamId: 'team2',
      isActive: true,
      title: '',
      startTime: '',
      durationHours: 0,
      minVolunteers: 0,
      maxVolunteers: 0,
      requirements: []
    },
    {
      id: 'shift3',
      eventDay: 2,
      teamId: 'team1',
      isActive: true,
      title: '',
      startTime: '',
      durationHours: 0,
      minVolunteers: 0,
      maxVolunteers: 0,
      requirements: []
    }
  ];

  const mockShiftVolunteers: Record<ShiftId, VolunteerInfo[]> = {
    shift1: [{ id: 'volunteer1', displayName: 'Volunteer One' }],
    shift2: [{ id: 'volunteer2', displayName: 'Volunteer Two' }],
    shift3: []
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders a list of shifts grouped by day and team', () => {
    const { getAllByText } = render(
      <ShiftOverviewList
        event={mockEvent}
        teams={mockTeams}
        shifts={mockShifts}
        shiftVolunteers={mockShiftVolunteers}
        qualifications={[]}
      />
    );

    // Check if team names are rendered
    expect(getAllByText('Team One')).toHaveLength(2);
    expect(getAllByText('Team Two')).toHaveLength(1);

    // Check if shifts are rendered
    expect(mockShiftCard).toHaveBeenCalledTimes(3);
    expect(mockShiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        shift: mockShifts[0],
        qualifications: [],
        volunteers: mockShiftVolunteers['shift1'],
        collapsible: true
      }),
      undefined
    );
    expect(mockShiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        shift: mockShifts[1],
        qualifications: [],
        volunteers: mockShiftVolunteers['shift2'],
        collapsible: true
      }),
      undefined
    );
    expect(mockShiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        shift: mockShifts[2],
        qualifications: [],
        volunteers: mockShiftVolunteers['shift3'],
        collapsible: true
      }),
      undefined
    );
  });

  it('renders empty state when no shifts are provided', () => {
    render(
      <ShiftOverviewList event={mockEvent} teams={mockTeams} shifts={[]} shiftVolunteers={{}} qualifications={[]} />
    );

    // Check that no team names or shifts are rendered
    expect(mockShiftCard).not.toHaveBeenCalled();
  });
});
