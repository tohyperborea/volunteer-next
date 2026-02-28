import { rolesEq } from './roles';

type UserRole =
  | { type: 'admin' }
  | { type: 'organiser'; eventId: string }
  | { type: 'team-lead'; eventId: string; teamId: string };

describe('rolesEq', () => {
  it('returns true for equal admin roles', () => {
    const roleA: UserRole = { type: 'admin' };
    const roleB: UserRole = { type: 'admin' };

    expect(rolesEq(roleA, roleB)).toBe(true);
  });

  it('returns false for admin and non-admin roles', () => {
    const roleA: UserRole = { type: 'admin' };
    const roleB: UserRole = { type: 'organiser', eventId: 'event-1' };

    expect(rolesEq(roleA, roleB)).toBe(false);
  });

  it('returns true for equal organiser roles with the same eventId', () => {
    const roleA: UserRole = { type: 'organiser', eventId: 'event-1' };
    const roleB: UserRole = { type: 'organiser', eventId: 'event-1' };

    expect(rolesEq(roleA, roleB)).toBe(true);
  });

  it('returns false for organiser roles with different eventIds', () => {
    const roleA: UserRole = { type: 'organiser', eventId: 'event-1' };
    const roleB: UserRole = { type: 'organiser', eventId: 'event-2' };

    expect(rolesEq(roleA, roleB)).toBe(false);
  });

  it('returns true for equal team-lead roles with the same eventId and teamId', () => {
    const roleA: UserRole = { type: 'team-lead', eventId: 'event-1', teamId: 'team-1' };
    const roleB: UserRole = { type: 'team-lead', eventId: 'event-1', teamId: 'team-1' };

    expect(rolesEq(roleA, roleB)).toBe(true);
  });

  it('returns false for team-lead roles with different eventIds', () => {
    const roleA: UserRole = { type: 'team-lead', eventId: 'event-1', teamId: 'team-1' };
    const roleB: UserRole = { type: 'team-lead', eventId: 'event-2', teamId: 'team-1' };

    expect(rolesEq(roleA, roleB)).toBe(false);
  });

  it('returns false for team-lead roles with different teamIds', () => {
    const roleA: UserRole = { type: 'team-lead', eventId: 'event-1', teamId: 'team-1' };
    const roleB: UserRole = { type: 'team-lead', eventId: 'event-1', teamId: 'team-2' };

    expect(rolesEq(roleA, roleB)).toBe(false);
  });

  it('returns false for roles of different types', () => {
    const roleA: UserRole = { type: 'organiser', eventId: 'event-1' };
    const roleB: UserRole = { type: 'team-lead', eventId: 'event-1', teamId: 'team-1' };

    expect(rolesEq(roleA, roleB)).toBe(false);
  });
});
