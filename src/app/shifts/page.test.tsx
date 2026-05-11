import { render, screen } from '@testing-library/react';
import EventShifts from './page';
import { getFilteredShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getCurrentEvent, getCurrentEventOrRedirect } from '@/session';
import ShiftOverviewList from '@/ui/shift-overview-list';
import AddShiftButton from '@/ui/add-shift-button';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key)
}));

jest.mock('@/service/event-service', () => ({
  getEventBySlug: jest.fn()
}));

jest.mock('@/service/shift-service', () => ({
  getFilteredShiftsForEvent: jest.fn(),
  getVolunteersForShifts: jest.fn().mockResolvedValue({})
}));

jest.mock('@/service/team-service', () => ({
  getTeamsForEvent: jest.fn(),
  getTeamsById: jest.fn()
}));

jest.mock('@/service/user-service', () => ({
  getVolunteersForShifts: jest.fn().mockResolvedValue({})
}));

jest.mock('@/service/qualification-service', () => ({
  getQualificationsForEvent: jest.fn().mockResolvedValue([])
}));

jest.mock('@/session', () => ({
  checkAuthorisation: jest.fn().mockResolvedValue(true),
  currentUser: jest.fn().mockResolvedValue({ id: 'current-user' }),
  getCurrentEvent: jest.fn(),
  getCurrentEventOrRedirect: jest.fn(),
  getMatchingRoles: jest.fn().mockResolvedValue([])
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  })
}));

jest.mock('@/ui/search-bar', () => ({
  __esModule: true,
  default: () => <div>SearchBar</div>
}));

jest.mock('@/email/template', () => ({
  sendEmailWithTemplate: jest.fn()
}));

jest.mock('@/ui/shift-overview-list', () => jest.fn());

jest.mock('@/ui/add-shift-button', () => jest.fn());

jest.mock('@/ui/shift-filters', () => jest.fn());

jest.mock('@/lib/shifts', () => ({
  getSaveShiftAction: jest.fn(() => jest.fn()),
  getDeleteShiftAction: jest.fn(() => jest.fn())
}));

jest.mock('@/utils/date', () => ({
  hasEventStarted: jest.fn().mockReturnValue(false)
}));

const mockGetCurrentEvent = getCurrentEvent as jest.MockedFunction<typeof getCurrentEvent>;
const mockGetCurrentEventOrRedirect = getCurrentEventOrRedirect as jest.MockedFunction<
  typeof getCurrentEventOrRedirect
>;
const mockGetFilteredShiftsForEvent = getFilteredShiftsForEvent as jest.MockedFunction<
  typeof getFilteredShiftsForEvent
>;
const mockGetTeamsForEvent = getTeamsForEvent as jest.MockedFunction<typeof getTeamsForEvent>;
const mockShiftOverviewList = ShiftOverviewList as jest.MockedFunction<typeof ShiftOverviewList>;
const mockAddShiftButton = AddShiftButton as jest.MockedFunction<typeof AddShiftButton>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EventShifts Page', () => {
  const mockEvent: EventInfo = {
    id: 'event-1',
    name: 'Test Event',
    slug: 'test-event',
    startDate: new Date(),
    endDate: new Date()
  };
  const mockTeams: TeamInfo[] = [
    {
      id: 'team-1',
      name: 'Team A',
      eventId: mockEvent.id,
      slug: 'team-1',
      description: 'description',
      contactAddress: ''
    },
    {
      id: 'team-2',
      name: 'Team B',
      eventId: mockEvent.id,
      slug: 'team-2',
      description: 'description',
      contactAddress: ''
    }
  ];
  const mockShifts: ShiftInfo[] = [
    {
      id: 'shift-1',
      eventDay: 1,
      teamId: 'team-1',
      title: 'Shift 1',
      startTime: '01:00',
      durationHours: 4,
      minVolunteers: 1,
      maxVolunteers: 3,
      isActive: true,
      requirements: []
    },
    {
      id: 'shift-2',
      eventDay: 1,
      teamId: 'team-2',
      title: 'Shift 2',
      startTime: '06:00',
      durationHours: 4,
      minVolunteers: 1,
      maxVolunteers: 3,
      isActive: true,
      requirements: []
    }
  ];

  const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

  it('renders the heading correctly', async () => {
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(screen.getByRole('heading', { name: 'allShifts' })).toBeInTheDocument();
  });

  it('renders the ShiftOverviewList component', async () => {
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(mockShiftOverviewList).toHaveBeenCalledWith(
      expect.objectContaining({
        event: mockEvent,
        teams: mockTeams,
        shifts: mockShifts,
        shiftVolunteers: {},
        qualifications: []
      }),
      undefined
    );
  });

  it('renders the Export Shifts button', async () => {
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(screen.getByRole('link', { name: 'export' })).toBeInTheDocument();
  });

  it('renders the Notify Volunteers button for authorised users', async () => {
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(screen.getByRole('button', { name: 'notifyVolunteers' })).toBeInTheDocument();
  });

  it('does not render the Notify Volunteers button for unauthorised users', async () => {
    const { checkAuthorisation } = require('@/session');
    checkAuthorisation.mockResolvedValue(false);
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(screen.queryByRole('button', { name: 'notifyVolunteers' })).not.toBeInTheDocument();
  });

  it('renders the Add Shift button for authorised users', async () => {
    const { checkAuthorisation } = require('@/session');
    checkAuthorisation.mockResolvedValue(true);
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(mockAddShiftButton).toHaveBeenCalledWith(
      expect.objectContaining({
        event: mockEvent,
        teams: mockTeams,
        qualifications: [],
        onSaveShift: expect.any(Function)
      }),
      undefined
    );
  });

  it('does not render the Add Shift button for unauthorised users', async () => {
    const { checkAuthorisation } = require('@/session');
    checkAuthorisation.mockResolvedValue(false);
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(mockAddShiftButton).not.toHaveBeenCalled();
  });

  it('does not render the Add Shift button if the event has started', async () => {
    const { checkAuthorisation } = require('@/session');
    checkAuthorisation.mockResolvedValue(true);
    const { hasEventStarted } = require('@/utils/date');
    hasEventStarted.mockReturnValue(true);
    mockGetCurrentEvent.mockResolvedValue(mockEvent);
    mockGetCurrentEventOrRedirect.mockResolvedValue(mockEvent);
    mockGetFilteredShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts(props));
    expect(mockAddShiftButton).not.toHaveBeenCalled();
  });
});
