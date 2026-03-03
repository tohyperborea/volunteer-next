import { roleMatches, rolesEq } from './roles';

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

describe('roleMatches', () => {
  it('should return true for matching admin roles', () => {
    const userRole: UserRole = { type: 'admin' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'admin' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return false for non-matching admin roles', () => {
    const userRole: UserRole = { type: 'organiser', eventId: '1' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'admin' };
    expect(roleMatches(userRole, acceptedRole)).toBe(false);
  });

  it('should return true for organiser roles matching eventId', () => {
    const userRole: UserRole = { type: 'organiser', eventId: '1' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'organiser', eventId: '1' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return true for organiser roles with no eventId in acceptedRole', () => {
    const userRole: UserRole = { type: 'organiser', eventId: '1' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'organiser' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return false for organiser roles with non-matching eventId', () => {
    const userRole: UserRole = { type: 'organiser', eventId: '1' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'organiser', eventId: '2' };
    expect(roleMatches(userRole, acceptedRole)).toBe(false);
  });

  it('should return true for team-lead roles matching eventId and teamId', () => {
    const userRole: UserRole = { type: 'team-lead', eventId: '1', teamId: 'A' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'team-lead', eventId: '1', teamId: 'A' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return true for team-lead roles with matching eventId and no teamId in acceptedRole', () => {
    const userRole: UserRole = { type: 'team-lead', eventId: '1', teamId: 'A' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'team-lead', eventId: '1' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return true for team-lead roles with matching teamId and no eventId in acceptedRole', () => {
    const userRole: UserRole = { type: 'team-lead', eventId: '1', teamId: 'A' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'team-lead', teamId: 'A' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return true for team-lead roles with no eventId or teamId in acceptedRole', () => {
    const userRole: UserRole = { type: 'team-lead', eventId: '1', teamId: 'A' };
    const acceptedRole: UserRoleMatchCriteria = { type: 'team-lead' };
    expect(roleMatches(userRole, acceptedRole)).toBe(true);
  });

  it('should return false for team-lead roles with non-matching eventId or teamId', () => {
    const userRole: UserRole = { type: 'team-lead', eventId: '1', teamId: 'A' };
    const acceptedRole1: UserRoleMatchCriteria = { type: 'team-lead', eventId: '2', teamId: 'A' };
    const acceptedRole2: UserRoleMatchCriteria = { type: 'team-lead', eventId: '1', teamId: 'B' };
    expect(roleMatches(userRole, acceptedRole1)).toBe(false);
    expect(roleMatches(userRole, acceptedRole2)).toBe(false);
  });
});
