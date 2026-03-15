import {
  getTeamInfoPath,
  getTeamShiftsPath,
  getTeamVolunteersPath,
  getQualificationsPath,
  getQualificationDetailsPath
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
