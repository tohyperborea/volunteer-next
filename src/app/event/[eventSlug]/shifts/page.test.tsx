import { render, screen } from '@testing-library/react';
import EventShifts from './page';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { notFound } from 'next/navigation';

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
  getShiftsForEvent: jest.fn(),
  getVolunteersForShifts: jest.fn().mockResolvedValue({})
}));

jest.mock('@/service/team-service', () => ({
  getTeamsForEvent: jest.fn()
}));

jest.mock('@/service/user-service', () => ({
  getVolunteersForShifts: jest.fn().mockResolvedValue({})
}));

jest.mock('@/session', () => ({
  checkAuthorisation: jest.fn().mockResolvedValue(true),
  currentUser: jest.fn().mockResolvedValue({ id: 'current-user' })
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

const mockGetEventBySlug = getEventBySlug as jest.MockedFunction<typeof getEventBySlug>;
const mockGetShiftsForEvent = getShiftsForEvent as jest.MockedFunction<typeof getShiftsForEvent>;
const mockGetTeamsForEvent = getTeamsForEvent as jest.MockedFunction<typeof getTeamsForEvent>;
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

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
      isActive: true
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
      isActive: true
    }
  ];
  const mockParams = Promise.resolve({ eventSlug: mockEvent.slug });
  const mockSearch = Promise.resolve({});

  it('renders the heading correctly', async () => {
    mockGetEventBySlug.mockResolvedValue(mockEvent);
    mockGetShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts({ params: mockParams, searchParams: mockSearch }));
    expect(screen.getByRole('heading', { name: 'allShifts' })).toBeInTheDocument();
  });

  it('renders the search bar', async () => {
    mockGetEventBySlug.mockResolvedValue(mockEvent);
    mockGetShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts({ params: mockParams, searchParams: mockSearch }));
    expect(screen.getByText('SearchBar')).toBeInTheDocument();
  });

  it('renders shifts grouped by day and team', async () => {
    mockGetEventBySlug.mockResolvedValue(mockEvent);
    mockGetShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    render(await EventShifts({ params: mockParams, searchParams: mockSearch }));
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('calls notFound if event is not found', async () => {
    mockGetEventBySlug.mockResolvedValue(null);
    await expect(EventShifts({ params: mockParams, searchParams: mockSearch })).rejects.toThrow();
    expect(mockNotFound).toHaveBeenCalled();
  });
});
