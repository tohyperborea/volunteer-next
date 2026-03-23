import { NextRequest } from 'next/server';
import { GET } from './route';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForTeam } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { shiftsToCSV } from '@/utils/csv-export';

jest.mock('@/utils/csv-export', () => ({
  shiftsToCSV: jest.fn()
}));
jest.mock('@/service/event-service', () => ({
  getEventBySlug: jest.fn()
}));
jest.mock('@/service/shift-service', () => ({
  getShiftsForTeam: jest.fn()
}));
jest.mock('@/service/team-service', () => ({
  getTeamBySlug: jest.fn()
}));
jest.mock('next/server', () => ({
  NextResponse: jest.fn().mockImplementation((body, init) => ({
    body,
    headers: new Headers(init?.headers),
    status: init?.status ?? 200
  }))
}));
jest.mock('@/session', () => ({
  checkAuthorisation: jest.fn().mockResolvedValue(true)
}));

const mockGetEventBySlug = getEventBySlug as jest.MockedFunction<typeof getEventBySlug>;
const mockGetShiftsForTeam = getShiftsForTeam as jest.MockedFunction<typeof getShiftsForTeam>;
const mockGetTeamBySlug = getTeamBySlug as jest.MockedFunction<typeof getTeamBySlug>;
const mockShiftsToCSV = shiftsToCSV as jest.MockedFunction<typeof shiftsToCSV>;

describe('GET /api/event/[eventSlug]/team/[teamSlug]/shifts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a CSV response when format is csv and event, team, and shifts exist', async () => {
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
      description: 'description',
      contactAddress: ''
    };
    const mockShifts: ShiftInfo[] = [
      {
        id: 'shift1',
        title: 'Shift 1',
        teamId: mockTeam.id,
        eventDay: 0,
        startTime: '11:00',
        durationHours: 4,
        minVolunteers: 1,
        maxVolunteers: 3,
        isActive: true
      }
    ];
    const mockCSVContent = 'csv-content';

    mockGetEventBySlug.mockResolvedValue(mockEvent);
    mockGetTeamBySlug.mockResolvedValue(mockTeam);
    mockGetShiftsForTeam.mockResolvedValue(mockShifts);
    mockShiftsToCSV.mockReturnValue(mockCSVContent);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'csv' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: mockEvent.slug, teamSlug: mockTeam.slug });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toContain(`${mockTeam.slug}-shifts`);
    expect(response.body).toBe(mockCSVContent);
  });

  it('should return a 404 response when event or team is not found', async () => {
    mockGetEventBySlug.mockResolvedValue(null);
    mockGetTeamBySlug.mockResolvedValue(null);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'csv' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({
      eventSlug: 'non-existent-event',
      teamSlug: 'non-existent-team'
    });
    const response = await GET(request, { params });

    expect(response.status).toBe(404);
    expect(response.body).toBe('Not Found');
  });

  it('should return a NotImplementedResponse for unsupported formats', async () => {
    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'xml' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: 'test-event', teamSlug: 'test-team' });

    const response = await GET(request, { params });

    expect(response.status).toBe(501);
    expect(response.body).toBe('Not Implemented');
  });
});
