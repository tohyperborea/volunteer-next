/**
 * Utility functions for working with user permissions.
 * @since 2026-03-16
 * @author Michael Townsend <@continuities>
 */

import { hasShiftEnded, hasShiftStarted } from '@/utils/date';

interface SecuredTypes {
  VolunteerInfo: VolunteerInfo;
}

type PermissionsModel = {
  [K in keyof SecuredTypes]?: {
    [P in OptionalKeys<SecuredTypes[K]>]?: 'volunteer' | UserRoleType[];
  };
};

/**
 * Defines the permissions for each property of each SecuredType.
 * Properties of SecuredTypes not listed here are not accessible to any users.
 * If a property is listed with 'volunteer', it is accessible to all users regardless of their roles.
 * Otherwise, the property is only accessible to users with at least one of the specified roles.
 */
const PERMISSIONS: PermissionsModel = {
  VolunteerInfo: {
    fullName: ['admin', 'organiser', 'team-lead'],
    email: ['admin', 'organiser', 'team-lead'],
    roles: 'volunteer'
  }
};

/**
 * Get the PermissionsProfile for a given user.
 * @param user The user for whom to get the permissions profile. If null, will return a profile with all permissions set to false.
 * @returns A PermissionsProfile object for the User
 */
export const getPermissionsProfile = (user: User | VolunteerInfo | null): PermissionsProfile => {
  const roles = user?.roles ?? [];
  const profile: PermissionsProfile = {
    userId: user?.id ?? '',
    admin: false,
    organiser: false,
    'team-lead': false
  };
  for (const role of roles) {
    switch (role.type) {
      case 'admin':
        profile.admin = true;
        break;
      case 'organiser':
        profile.organiser = true;
        break;
      case 'team-lead':
        profile['team-lead'] = true;
        break;
    }
  }
  return profile;
};

/**
 * Check whether a user has access to a specific property of a SecuredType.
 * @param typeToCheck The type of object to check access for
 * @param property The specific property of the object to check access for
 * @param profile The PermissionsProfile of the user for whom to check access
 * @returns A boolean indicating whether the user has access
 */
export const canAccess = <T extends keyof SecuredTypes, P extends OptionalKeys<SecuredTypes[T]>>(
  typeToCheck: T,
  property: P,
  profile: PermissionsProfile
): boolean => {
  const permittedRoles = PERMISSIONS[typeToCheck]?.[property];
  if (!permittedRoles) {
    // Deny by default is safest
    console.warn(
      `No permissions defined for ${typeToCheck}.${String(property)}, denying access by default.`
    );
    return false;
  }
  if (permittedRoles === 'volunteer') {
    // If the property is accessible to volunteers, then all users have access
    return true;
  }
  for (const role of permittedRoles) {
    if (profile[role as UserRoleType]) {
      return true;
    }
  }
  return false;
};

/**
 * Check whether a user can sign up for a shift
 * @param event - The event the shift belongs to
 * @param shift - The shift to check
 * @returns Whether the user can sign up for the shift
 */
export const canSignupForShift = (event: EventInfo, shift: ShiftInfo): boolean => {
  return !hasShiftEnded(event, shift);
};

/**
 * Check whether a user can cancel a sign up for a shift
 * @param event - The event the shift belongs to
 * @param shift - The shift to check
 * @returns Whether the user can cancel a sign up for the shift
 */
export const canCancelShiftSignup = (event: EventInfo, shift: ShiftInfo): boolean => {
  return !hasShiftStarted(event, shift);
};
