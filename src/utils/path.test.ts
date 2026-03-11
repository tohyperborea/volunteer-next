import {
  getEventShiftsApiPath,
  getEventShiftsPath,
  getQualificationDetailsPath,
  getQualificationsPath,
  getTeamInfoPath,
  getTeamShiftsApiPath,
  getTeamShiftsPath,
  getTeamVolunteersPath
} from './path';

describe('getTeamInfoPath', () => {
  it('should return the correct path for team info', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-abc';
    const result = getTeamInfoPath(eventSlug, teamSlug);
    expect(result).toBe('/event/event-123/team/team-abc');
  });
});

describe('getTeamShiftsPath', () => {
  it('should return the correct path for team shifts', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-abc';
    const result = getTeamShiftsPath(eventSlug, teamSlug);
    expect(result).toBe('/event/event-123/team/team-abc/shifts');
  });
});

describe('getTeamVolunteersPath', () => {
  it('should return the correct path for team volunteers', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-abc';
    const result = getTeamVolunteersPath(eventSlug, teamSlug);
    expect(result).toBe('/event/event-123/team/team-abc/volunteers');
  });
});

describe('getQualificationsPath', () => {
  it('should return the correct qualifications path for a given eventSlug', () => {
    const eventSlug = 'test-event';
    const result = getQualificationsPath(eventSlug);
    expect(result).toBe('/event/test-event/qualification');
  });
});

describe('getQualificationDetailsPath', () => {
  it('should return the correct qualification path for given eventSlug and qualificationId', () => {
    const eventSlug = 'test-event';
    const qualificationId = '12345';
    const result = getQualificationDetailsPath({ eventSlug, qualificationId });
    expect(result).toBe('/event/test-event/qualification/12345');
  });
});

describe('getEventShiftsPath', () => {
  it('should return the correct path for event shifts', () => {
    const eventSlug = 'event-123';
    const result = getEventShiftsPath(eventSlug);
    expect(result).toBe('/event/event-123/shifts');
  });
});

describe('getEventShiftsApiPath', () => {
  it('should return the correct API path for event shifts with default format', () => {
    const eventSlug = 'event-123';
    const result = getEventShiftsApiPath(eventSlug);
    expect(result).toBe('/api/event/event-123/shifts?format=json');
  });

  it('should return the correct API path for event shifts with CSV format', () => {
    const eventSlug = 'event-123';
    const result = getEventShiftsApiPath(eventSlug, { format: 'csv' });
    expect(result).toBe('/api/event/event-123/shifts?format=csv');
  });

  it('should return the correct API path for event shifts with JSON format explicitly set', () => {
    const eventSlug = 'event-123';
    const result = getEventShiftsApiPath(eventSlug, { format: 'json' });
    expect(result).toBe('/api/event/event-123/shifts?format=json');
  });
});

describe('getTeamShiftsApiPath', () => {
  it('should return the correct API path for team shifts with default format', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-123';
    const result = getTeamShiftsApiPath(eventSlug, teamSlug);
    expect(result).toBe('/api/event/event-123/team/team-123/shifts?format=json');
  });

  it('should return the correct API path for team shifts with CSV format', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-123';
    const result = getTeamShiftsApiPath(eventSlug, teamSlug, { format: 'csv' });
    expect(result).toBe('/api/event/event-123/team/team-123/shifts?format=csv');
  });

  it('should return the correct API path for team shifts with JSON format explicitly set', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-123';
    const result = getTeamShiftsApiPath(eventSlug, teamSlug, { format: 'json' });
    expect(result).toBe('/api/event/event-123/team/team-123/shifts?format=json');
  });
});
