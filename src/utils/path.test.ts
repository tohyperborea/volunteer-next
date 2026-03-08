import {
  getTeamInfoPath,
  getTeamShiftsPath,
  getTeamVolunteersPath,
  getQualificationsPath,
  getQualificationDetailsPath,
  getUserApiPath,
  getCreateUserPath,
  getEditUserPath,
  getUserProfilePath,
  getUsersDashboardPath
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

describe('getUserApiPath', () => {
  it('should return the correct API path without filters', () => {
    const result = getUserApiPath();
    expect(result).toBe('/api/user');
  });

  it('should return the correct API path with a single filter', () => {
    const filter: UserFilters = { roleType: 'admin' };
    const result = getUserApiPath(filter);
    expect(result).toBe('/api/user?roleType=admin');
  });

  it('should return the correct API path with multiple filters', () => {
    const filter: UserFilters = { roleType: 'admin', withQualification: 'qual-id' };
    const result = getUserApiPath(filter);
    expect(result).toBe('/api/user?roleType=admin&withQualification=qual-id');
  });

  it('should encode special characters in filter values', () => {
    const filter: UserFilters = { searchQuery: 'John Doe & Co.' };
    const result = getUserApiPath(filter);
    expect(result).toBe('/api/user?searchQuery=John+Doe+%26+Co.');
  });
});

describe('getUsersDashboardPath', () => {
  it('should return the correct path for the users dashboard', () => {
    const result = getUsersDashboardPath();
    expect(result).toBe('/user');
  });
});

describe('getCreateUserPath', () => {
  it('should return the correct path for creating a user', () => {
    const result = getCreateUserPath();
    expect(result).toBe('/create-user');
  });
});

describe('getEditUserPath', () => {
  it('should return the correct path for editing a user', () => {
    const userId = 'user-123';
    const result = getEditUserPath(userId);
    expect(result).toBe('/update-user/user-123');
  });
});

describe('getUserProfilePath', () => {
  it('should return the correct path for a user profile', () => {
    const userId = 'user-123';
    const result = getUserProfilePath(userId);
    expect(result).toBe('/user/user-123');
  });
});
