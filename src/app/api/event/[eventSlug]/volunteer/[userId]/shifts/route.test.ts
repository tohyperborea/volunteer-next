import { NextRequest } from 'next/server';
import { GET } from './route';
import { getEventBySlug } from '@/service/event-service';
import { getTeamsForEvent } from '@/service/team-service';
import { shiftsToCSV } from '@/utils/csv-export';
import { getVolunteerById } from '@/lib/volunteer';

jest.mock('@/utils/csv-export', () => ({
  shiftsToCSV: jest.fn()
}));
jest.mock('@/service/event-service', () => ({
  getEventBySlug: jest.fn()
}));
jest.mock('@/service/shift-service', () => ({
  getShiftsForVolunteer: jest.fn()
}));
jest.mock('@/service/team-service', () => ({
  getTeamsForEvent: jest.fn()
}));
jest.mock('@/lib/volunteer', () => ({
  getVolunteerById: jest.fn()
}));
jest.mock('next/server', () => ({
  NextResponse: jest.fn().mockImplementation((body, init) => ({
    body,
    headers: new Headers(init?.headers),
    status: init?.status ?? 200
  }))
}));
jest.mock('@/session', () => ({
  checkAuthorisation: jest.fn().mockResolvedValue(true),
  currentUser: jest.fn().mockResolvedValue({ id: 'current-user' })
}));

const mockGetEventBySlug = getEventBySlug as jest.MockedFunction<typeof getEventBySlug>;
const mockGetVolunteer = getVolunteerById as jest.MockedFunction<typeof getVolunteerById>;
const mockGetTeamsForEvent = getTeamsForEvent as jest.MockedFunction<typeof getTeamsForEvent>;
const mockShiftsToCSV = shiftsToCSV as jest.MockedFunction<typeof shiftsToCSV>;

describe('GET /api/event/[eventSlug]/volunteer/[userId]/shifts', () => {
  const mockVolunteer: VolunteerInfo = {
    id: 'test-user',
    displayName: 'Test User'
  };
  const mockEvent: EventInfo = {
    id: 'event1',
    name: 'Test Event',
    slug: 'event-1',
    startDate: new Date(),
    endDate: new Date()
  };
  const mockTeam: TeamInfo = {
    id: 'team1',
    name: 'Test Team',
    eventId: mockEvent.id,
    slug: 'team-1',
    description: 'description'
  };
  const mockCSVContent = 'csv-content';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a CSV response when format is csv and event, volunteer exist', async () => {
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockGetEventBySlug.mockResolvedValue(mockEvent);
    mockGetTeamsForEvent.mockResolvedValue([mockTeam]);
    mockShiftsToCSV.mockReturnValue(mockCSVContent);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'csv' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: mockEvent.slug, userId: 'test-user' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toContain(`my-shifts`);
    expect(response.body).toBe(mockCSVContent);
  });

  it('should return a 404 response when event or user is not found', async () => {
    mockGetVolunteer.mockResolvedValue(null);
    mockGetEventBySlug.mockResolvedValue(null);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'csv' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({
      eventSlug: 'non-existent-event',
      userId: 'test-user'
    });
    const response = await GET(request, { params });

    expect(response.status).toBe(404);
    expect(response.body).toBe('Not Found');
  });

  it('should return a NotImplementedResponse for unsupported formats', async () => {
    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'xml' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: 'test-event', userId: 'test-user' });

    const response = await GET(request, { params });

    expect(response.status).toBe(501);
    expect(response.body).toBe('Not Implemented');
  });
});
