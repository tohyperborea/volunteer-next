import { getManagedQualifications } from './qualification';
import { getEvents } from '@/service/event-service';
import {
  getQualificationsForEvents,
  getQualificationsForTeams
} from '@/service/qualification-service';

const mockGetEvents = getEvents as jest.MockedFunction<typeof getEvents>;
const mockGetQualificationsForEvents = getQualificationsForEvents as jest.MockedFunction<
  typeof getQualificationsForEvents
>;
const mockGetQualificationsForTeams = getQualificationsForTeams as jest.MockedFunction<
  typeof getQualificationsForTeams
>;

jest.mock('@/service/event-service', () => ({
  getEvents: jest.fn()
}));

jest.mock('@/service/qualification-service', () => ({
  getQualificationsForEvents: jest.fn(),
  getQualificationsForTeams: jest.fn()
}));

describe('getManagedQualifications', () => {
  const mockEvents = [
    {
      id: 'event1',
      name: 'Event 1',
      slug: 'event1',
      startDate: new Date(),
      endDate: new Date()
    },
    {
      id: 'event2',
      name: 'Event 2',
      slug: 'event2',
      startDate: new Date(),
      endDate: new Date()
    }
  ];
  const mockQualifications: QualificationInfo[] = [
    {
      id: 'qual1',
      name: 'Qualification 1',
      eventId: 'event1',
      errorMessage: 'error'
    },
    {
      id: 'qual2',
      name: 'Qualification 2',
      eventId: 'event2',
      errorMessage: 'error'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all qualifications for admin users', async () => {
    mockGetEvents.mockResolvedValue(mockEvents);
    mockGetQualificationsForEvents.mockResolvedValue(mockQualifications);

    const result = await getManagedQualifications({
      isAdmin: true,
      organisesEvents: [],
      leadsTeams: []
    });

    expect(mockGetEvents).toHaveBeenCalled();
    expect(mockGetQualificationsForEvents).toHaveBeenCalledWith(['event1', 'event2']);
    expect(result).toEqual(mockQualifications);
  });

  it('should return qualifications for events organised by the user', async () => {
    mockGetQualificationsForEvents.mockResolvedValue(mockQualifications);

    const result = await getManagedQualifications({
      isAdmin: false,
      organisesEvents: ['event1'],
      leadsTeams: []
    });

    expect(mockGetEvents).not.toHaveBeenCalled();
    expect(mockGetQualificationsForEvents).toHaveBeenCalledWith(['event1']);
    expect(result).toEqual(mockQualifications);
  });

  it('should return qualifications for teams led by the user', async () => {
    mockGetQualificationsForTeams.mockResolvedValue(mockQualifications);

    const result = await getManagedQualifications({
      isAdmin: false,
      organisesEvents: [],
      leadsTeams: ['team1']
    });

    expect(mockGetEvents).not.toHaveBeenCalled();
    expect(mockGetQualificationsForTeams).toHaveBeenCalledWith(['team1']);
    expect(result).toEqual(mockQualifications);
  });

  it('should return deduplicated qualifications when user has overlapping roles', async () => {
    const overlappingQualifications: QualificationInfo[] = [
      ...mockQualifications,
      mockQualifications[0]
    ];
    mockGetQualificationsForEvents.mockResolvedValue(overlappingQualifications);
    mockGetQualificationsForTeams.mockResolvedValue(overlappingQualifications);

    const result = await getManagedQualifications({
      isAdmin: false,
      organisesEvents: ['event1'],
      leadsTeams: ['team1']
    });

    expect(mockGetQualificationsForEvents).toHaveBeenCalledWith(['event1']);
    expect(mockGetQualificationsForTeams).toHaveBeenCalledWith(['team1']);
    expect(result).toEqual(mockQualifications);
  });

  it('should return an empty array if the user has no roles', async () => {
    const result = await getManagedQualifications({
      isAdmin: false,
      organisesEvents: [],
      leadsTeams: []
    });

    expect(mockGetEvents).not.toHaveBeenCalled();
    expect(mockGetQualificationsForEvents).not.toHaveBeenCalled();
    expect(mockGetQualificationsForTeams).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
