import {
  getEventShiftsApiPath,
  getEventShiftsPath,
  getQualificationDetailsPath,
  getQualificationsPath,
  getTeamShiftsApiPath,
  getTeamShiftsPath,
  getTeamVolunteersPath,
  getVolunteerShiftsApiPath,
  getUserApiPath,
  getCreateUserPath,
  getEditUserPath,
  getUserProfilePath,
  getUsersDashboardPath,
  getUpdateTeamPath,
  getCreateTeamPath,
  getTeamsPath,
  getTeamVolunteersApiPath,
  getEventsPath,
  getCreateEventPath,
  getEventPath
} from './path';

describe('getTeamsPath', () => {
  it('should return the correct path for teams', () => {
    const eventSlug = 'event-123';
    const result = getTeamsPath(eventSlug);
    expect(result).toBe('/event/event-123/team');
  });
});

describe('getTeamShiftsPath', () => {
  it('should return the correct path for team shifts', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-abc';
    const result = getTeamShiftsPath(eventSlug, teamSlug);
    expect(result).toBe('/event/event-123/team/team-abc');
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

describe('getUpdateTeamPath', () => {
  it('should return the correct path for updating a team', () => {
    const eventSlug = 'event-123';
    const teamId = 'team-456';
    const result = getUpdateTeamPath(eventSlug, teamId);
    expect(result).toBe('/event/event-123/update-team/team-456');
  });
});

describe('getCreateTeamPath', () => {
  it('should return the correct path for creating a team', () => {
    const eventSlug = 'event-123';
    const result = getCreateTeamPath(eventSlug);
    expect(result).toBe('/event/event-123/create-team');
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

describe('getEventPath', () => {
  it('should return the correct path for a given event slug', () => {
    const eventSlug = 'event-123';
    const result = getEventPath(eventSlug);
    expect(result).toBe('/event/event-123');
  });
});

describe('getCreateEventPath', () => {
  it('should return the correct path for creating an event', () => {
    const result = getCreateEventPath();
    expect(result).toBe('/create-event');
  });
});

describe('getEventsPath', () => {
  it('should return the correct path for events', () => {
    const result = getEventsPath();
    expect(result).toBe('/event');
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

describe('getVolunteerShiftsApiPath', () => {
  it('should return the correct API path for volunteer shifts with default format', () => {
    const eventSlug = 'event-123';
    const userId = 'user-123';
    const result = getVolunteerShiftsApiPath(eventSlug, userId);
    expect(result).toBe('/api/event/event-123/volunteer/user-123/shifts?format=json');
  });

  it('should return the correct API path for volunteer shifts with CSV format', () => {
    const eventSlug = 'event-123';
    const userId = 'user-123';
    const result = getVolunteerShiftsApiPath(eventSlug, userId, { format: 'csv' });
    expect(result).toBe('/api/event/event-123/volunteer/user-123/shifts?format=csv');
  });

  it('should return the correct API path for volunteer shifts with JSON format explicitly set', () => {
    const eventSlug = 'event-123';
    const userId = 'user-123';
    const result = getVolunteerShiftsApiPath(eventSlug, userId, { format: 'json' });
    expect(result).toBe('/api/event/event-123/volunteer/user-123/shifts?format=json');
  });
});

describe('getTeamVolunteersApiPath', () => {
  it('should return the correct API path for team volunteers with default format', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-123';
    const result = getTeamVolunteersApiPath(eventSlug, teamSlug);
    expect(result).toBe('/api/event/event-123/team/team-123/volunteers?format=json');
  });

  it('should return the correct API path for team volunteers with CSV format', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-123';
    const result = getTeamVolunteersApiPath(eventSlug, teamSlug, { format: 'csv' });
    expect(result).toBe('/api/event/event-123/team/team-123/volunteers?format=csv');
  });

  it('should return the correct API path for team volunteers with JSON format explicitly set', () => {
    const eventSlug = 'event-123';
    const teamSlug = 'team-123';
    const result = getTeamVolunteersApiPath(eventSlug, teamSlug, { format: 'json' });
    expect(result).toBe('/api/event/event-123/team/team-123/volunteers?format=json');
  });
});

describe('getUserApiPath', () => {
  it('should return the correct API path without params', () => {
    const result = getUserApiPath();
    expect(result).toBe('/api/user?format=json');
  });

  it('should return the correct API path with a single filter', () => {
    const filter: UserFilters = { roleType: 'admin' };
    const result = getUserApiPath(filter);
    expect(result).toBe('/api/user?roleType=admin&format=json');
  });

  it('should return the correct API path with multiple filters', () => {
    const filter: UserFilters = { roleType: 'admin', withQualification: 'qual-id' };
    const result = getUserApiPath(filter);
    expect(result).toBe('/api/user?roleType=admin&withQualification=qual-id&format=json');
  });

  it('should encode special characters in filter values', () => {
    const filter: UserFilters = { searchQuery: 'John Doe & Co.' };
    const result = getUserApiPath(filter);
    expect(result).toBe('/api/user?searchQuery=John+Doe+%26+Co.&format=json');
  });

  it('should accept a custom format', () => {
    const filter: UserFilters = { roleType: 'admin' };
    const result = getUserApiPath(filter, { format: 'csv' });
    expect(result).toBe('/api/user?roleType=admin&format=csv');
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
