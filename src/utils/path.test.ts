import { getTeamInfoPath, getTeamShiftsPath, getTeamVolunteersPath } from './path';

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
