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
  getUpdateEventPath
} from './path';

describe('getTeamsPath', () => {
  it('should return the correct path for teams', () => {
    const result = getTeamsPath();
    expect(result).toBe('/team');
  });
});

describe('getTeamShiftsPath', () => {
  it('should return the correct path for team shifts', () => {
    const teamSlug = 'team-abc';
    const result = getTeamShiftsPath(teamSlug);
    expect(result).toBe('/team/team-abc');
  });
});

describe('getTeamVolunteersPath', () => {
  it('should return the correct path for team volunteers', () => {
    const teamSlug = 'team-abc';
    const result = getTeamVolunteersPath(teamSlug);
    expect(result).toBe('/team/team-abc/volunteers');
  });
});

describe('getUpdateTeamPath', () => {
  it('should return the correct path for updating a team', () => {
    const teamId = 'team-456';
    const result = getUpdateTeamPath(teamId);
    expect(result).toBe('/update-team/team-456');
  });
});

describe('getCreateTeamPath', () => {
  it('should return the correct path for creating a team', () => {
    const result = getCreateTeamPath();
    expect(result).toBe('/create-team');
  });
});

describe('getQualificationsPath', () => {
  it('should return the correct qualifications path', () => {
    const result = getQualificationsPath();
    expect(result).toBe('/qualification');
  });
});

describe('getQualificationDetailsPath', () => {
  it('should return the correct qualification path', () => {
    const qualificationId = '12345';
    const result = getQualificationDetailsPath(qualificationId);
    expect(result).toBe('/qualification/12345');
  });
});

describe('getCreateEventPath', () => {
  it('should return the correct path for creating an event', () => {
    const result = getCreateEventPath();
    expect(result).toBe('/create-event');
  });
});

describe('getUpdateEventPath', () => {
  it('should return the correct path for updating an event', () => {
    const eventId = 'event-123';
    const result = getUpdateEventPath(eventId);
    expect(result).toBe('/update-event/event-123');
  });
});

describe('getEventsPath', () => {
  it('should return the correct path for events', () => {
    const result = getEventsPath();
    expect(result).toBe('/events');
  });
});

describe('getEventShiftsPath', () => {
  it('should return the correct path for event shifts', () => {
    const result = getEventShiftsPath();
    expect(result).toBe('/shifts');
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
