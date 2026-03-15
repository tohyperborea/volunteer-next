import { NextRequest, NextResponse } from 'next/server';
import { GET } from './route';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { shiftsToCSV } from '@/utils/csv-export';

jest.mock('@/utils/csv-export', () => ({
  shiftsToCSV: jest.fn()
}));
jest.mock('@/service/event-service', () => ({
  getEventBySlug: jest.fn()
}));
jest.mock('@/service/shift-service', () => ({
  getShiftsForEvent: jest.fn()
}));
jest.mock('@/service/team-service', () => ({
  getTeamsForEvent: jest.fn()
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
const mockGetShiftsForEvent = getShiftsForEvent as jest.MockedFunction<typeof getShiftsForEvent>;
const mockGetTeamsForEvent = getTeamsForEvent as jest.MockedFunction<typeof getTeamsForEvent>;
const mockShiftsToCSV = shiftsToCSV as jest.MockedFunction<typeof shiftsToCSV>;

describe('GET /api/event/[eventSlug]/shifts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a CSV response when format is csv and event exists', async () => {
    const mockEvent: EventInfo = {
      id: 'event1',
      slug: 'event1',
      name: 'Test Event',
      startDate: new Date('2026-03-11Z'),
      endDate: new Date('2026-03-15Z')
    };
    const mockShifts: ShiftInfo[] = [
      {
        id: 'shift1',
        eventDay: 0,
        teamId: 'team1',
        startTime: '10:00',
        durationHours: 2,
        title: 'Test Shift',
        minVolunteers: 1,
        maxVolunteers: 3,
        isActive: true
      }
    ];
    const mockTeams: TeamInfo[] = [
      {
        id: 'team1',
        name: 'Team A',
        eventId: mockEvent.id,
        slug: 'team1',
        description: 'description'
      }
    ];
    const mockCSVContent = 'csv-content';

    mockGetEventBySlug.mockResolvedValue(mockEvent);
    mockGetShiftsForEvent.mockResolvedValue(mockShifts);
    mockGetTeamsForEvent.mockResolvedValue(mockTeams);
    mockShiftsToCSV.mockReturnValue(mockCSVContent);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'csv' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: mockEvent.slug });

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toBe(
      `attachment; filename="${mockEvent.slug}-shifts.csv"`
    );
    expect(response.body).toBe(mockCSVContent);
  });

  it('should return 404 when event does not exist', async () => {
    mockGetEventBySlug.mockResolvedValue(null);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'csv' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: 'non-existent-event' });

    const response = await GET(request, { params });

    expect(response.status).toBe(404);
    expect(response.body).toBe('Not Found');
  });

  it('should return 501 for unsupported formats', async () => {
    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'xml' }) }
    } as unknown as NextRequest;
    const params = Promise.resolve({ eventSlug: 'test-event' });

    const response = await GET(request, { params });

    expect(response.status).toBe(501);
    expect(response.body).toBe('Not Implemented');
  });
});
