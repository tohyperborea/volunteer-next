import { getManagedQualifications } from './qualification';
import {
  getQualificationsForEvent,
  getQualificationsForTeams
} from '@/service/qualification-service';
import { hasEventEnded } from '@/utils/date';

const mockGetQualificationsForEvent = getQualificationsForEvent as jest.MockedFunction<
  typeof getQualificationsForEvent
>;
const mockGetQualificationsForTeams = getQualificationsForTeams as jest.MockedFunction<
  typeof getQualificationsForTeams
>;

jest.mock('@/service/event-service', () => ({
  getEvents: jest.fn()
}));

jest.mock('@/service/qualification-service', () => ({
  getQualificationsForEvent: jest.fn(),
  getQualificationsForTeams: jest.fn()
}));

jest.mock('@/utils/date', () => ({
  hasEventEnded: jest.fn()
}));

const mockHasEventEnded = hasEventEnded as jest.MockedFunction<typeof hasEventEnded>;

describe('getManagedQualifications', () => {
  const mockEvent = {
    id: 'event1',
    name: 'Event 1',
    slug: 'event1',
    startDate: new Date(),
    endDate: new Date()
  };
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
    mockGetQualificationsForEvent.mockResolvedValue([mockQualifications[0]]);

    const result = await getManagedQualifications({
      event: mockEvent,
      isAdmin: true,
      organisesEvent: false,
      leadsTeams: []
    });

    expect(mockGetQualificationsForEvent).toHaveBeenCalledWith('event1');
    expect(result).toEqual([mockQualifications[0]]);
  });

  it('should return qualifications for events organised by the user', async () => {
    mockGetQualificationsForEvent.mockResolvedValue([mockQualifications[0]]);

    const result = await getManagedQualifications({
      event: mockEvent,
      isAdmin: false,
      organisesEvent: true,
      leadsTeams: []
    });

    expect(mockGetQualificationsForEvent).toHaveBeenCalledWith('event1');
    expect(result).toEqual([mockQualifications[0]]);
  });

  it('should return qualifications for teams led by the user', async () => {
    mockGetQualificationsForTeams.mockResolvedValue([mockQualifications[0]]);

    const result = await getManagedQualifications({
      event: mockEvent,
      isAdmin: false,
      organisesEvent: false,
      leadsTeams: ['team1']
    });

    expect(mockGetQualificationsForTeams).toHaveBeenCalledWith(['team1']);
    expect(result).toEqual([mockQualifications[0]]);
  });

  it('should return deduplicated qualifications when user has overlapping roles', async () => {
    const overlappingQualifications: QualificationInfo[] = [
      mockQualifications[0],
      mockQualifications[0]
    ];
    mockGetQualificationsForEvent.mockResolvedValue(overlappingQualifications);
    mockGetQualificationsForTeams.mockResolvedValue(overlappingQualifications);

    const result = await getManagedQualifications({
      event: mockEvent,
      isAdmin: false,
      organisesEvent: true,
      leadsTeams: ['team1']
    });

    expect(mockGetQualificationsForEvent).toHaveBeenCalledWith('event1');
    expect(mockGetQualificationsForTeams).not.toHaveBeenCalled();
    expect(result).toEqual([mockQualifications[0]]);
  });

  it('should return an empty array if the user has no roles', async () => {
    const result = await getManagedQualifications({
      event: mockEvent,
      isAdmin: false,
      organisesEvent: false,
      leadsTeams: []
    });

    expect(mockGetQualificationsForEvent).not.toHaveBeenCalled();
    expect(mockGetQualificationsForTeams).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return an empty array if the event has ended', async () => {
    mockHasEventEnded.mockReturnValue(true);
    const result = await getManagedQualifications({
      event: mockEvent,
      isAdmin: true,
      organisesEvent: false,
      leadsTeams: []
    });

    expect(mockGetQualificationsForEvent).not.toHaveBeenCalled();
    expect(mockGetQualificationsForTeams).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
