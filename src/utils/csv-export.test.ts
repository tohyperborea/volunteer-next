import { shiftsToCSV } from './csv-export';

describe('shiftsToCSV', () => {
  const event: EventInfo = {
    id: 'event1',
    slug: 'event1',
    name: 'Test Event',
    startDate: new Date('2026-03-11Z'),
    endDate: new Date('2026-03-15Z')
  };
  const teams: TeamInfo[] = [
    {
      id: 'team1',
      name: 'Team Alpha',
      eventId: event.id,
      slug: 'team1',
      description: 'description'
    }
  ];
  const shifts: ShiftInfo[] = [
    {
      id: 'shift1',
      eventDay: 0,
      teamId: 'team1',
      startTime: '08:00',
      durationHours: 4,
      title: 'Shift 1',
      minVolunteers: 1,
      maxVolunteers: 5,
      isActive: true
    }
  ];
  const john: VolunteerInfo = {
    id: 'user1',
    displayName: 'John D.',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    roles: []
  };
  const jane: VolunteerInfo = {
    id: 'user2',
    displayName: 'Jane S.',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    roles: []
  };

  it('should generate a CSV with correct headers and data', () => {
    const shiftVolunteers = {
      shift1: [john]
    };

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });

    const expectedCSV = [
      'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers',
      '2026-03-11,Team Alpha,Shift 1,08:00,4,John D. <john.doe@example.com>'
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });

  it('should still work if fullName and email are not present', () => {
    const volunteer: VolunteerInfo = {
      id: 'user3',
      displayName: 'Scooby'
    };
    const shiftVolunteers = {
      shift1: [volunteer]
    };

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });
    const expectedCSV = [
      'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers',
      '2026-03-11,Team Alpha,Shift 1,08:00,4,Scooby'
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });

  it('should handle volunteers with special characters in their names', () => {
    const specialUser: VolunteerInfo = {
      id: 'user3',
      displayName: 'Alice "The Great" O\'Connor',
      email: 'alice.o.conner@example.com',
      roles: []
    };
    const shiftVolunteers = {
      shift1: [specialUser]
    };

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });

    const expectedCSV = [
      'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers',
      '2026-03-11,Team Alpha,Shift 1,08:00,4,"Alice ""The Great"" O\'Connor <alice.o.conner@example.com>"'
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });

  it('should handle shifts with no volunteers', () => {
    const shiftVolunteers = {};

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });

    const expectedCSV = [
      'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers',
      '2026-03-11,Team Alpha,Shift 1,08:00,4,'
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });

  it('should handle multiple volunteers for a shift', () => {
    const shiftVolunteers = {
      shift1: [john, jane]
    };

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });

    const expectedCSV = [
      'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers',
      '2026-03-11,Team Alpha,Shift 1,08:00,4,"John D. <john.doe@example.com>\rJane S. <jane.smith@example.com>"'
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });

  it('should handle multiple shifts and teams', () => {
    const twoTeams: TeamInfo[] = [
      ...teams,
      {
        id: 'team2',
        name: 'Team Beta',
        eventId: event.id,
        slug: 'team2',
        description: 'description'
      }
    ];
    const twoShifts: ShiftInfo[] = [
      ...shifts,
      {
        id: 'shift2',
        eventDay: 1,
        teamId: 'team2',
        startTime: '10:00',
        durationHours: 3,
        title: 'Shift 2',
        minVolunteers: 1,
        maxVolunteers: 5,
        isActive: true
      }
    ];
    const shiftVolunteers = {
      shift1: [john],
      shift2: [jane]
    };

    const result = shiftsToCSV({ event, teams: twoTeams, shifts: twoShifts, shiftVolunteers });

    const expectedCSV = [
      'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers',
      '2026-03-11,Team Alpha,Shift 1,08:00,4,John D. <john.doe@example.com>',
      '2026-03-12,Team Beta,Shift 2,10:00,3,Jane S. <jane.smith@example.com>'
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });

  it('should handle empty shifts array', () => {
    const shifts: ShiftInfo[] = [];
    const shiftVolunteers = {};

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });

    const expectedCSV = 'Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers';

    expect(result).toBe(expectedCSV);
  });

  it('should guard against CSV injection', () => {
    const maliciousUser: VolunteerInfo = {
      id: 'user4',
      displayName: "=CMD|' /C calc'!A0",
      email: 'badguy@evil.com',
      roles: []
    };
    const shiftVolunteers = {
      shift1: [maliciousUser]
    };

    const result = shiftsToCSV({ event, teams, shifts, shiftVolunteers });

    const expectedCSV = [
      `Date,Team,Shift Title,Start Time,Duration (Hours),Volunteers`,
      `2026-03-11,Team Alpha,Shift 1,08:00,4,"\t=CMD|' /C calc'!A0 <badguy@evil.com>"`
    ].join('\r\n');

    expect(result).toBe(expectedCSV);
  });
});
