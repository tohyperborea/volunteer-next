import { getUser } from '@/service/user-service';
import { canAccess, getPermissionsProfile } from '@/utils/permissions';

const stripPII = (user: User, profile: PermissionsProfile): VolunteerInfo => {
  const volunteer: VolunteerInfo = {
    id: user.id,
    displayName: user.chosenName
  };

  const isSelf = user.id === profile.userId;
  // If the currentUser can access the email, we can skip the extra getPermissionsProfile call
  const canAccessEmail = isSelf || canAccess('VolunteerInfo', 'email', profile);
  const userPermissionsProfile = canAccessEmail ? null : getPermissionsProfile(user);

  if (isSelf || canAccess('VolunteerInfo', 'fullName', profile)) {
    volunteer.fullName = user.name;
    if (!user.chosenName) {
      volunteer.displayName = user.name;
    }
  }

  // We need to share email addresses of organisers and team leads so people can reach them
  if (
    canAccessEmail ||
    userPermissionsProfile?.['team-lead'] ||
    userPermissionsProfile?.organiser
  ) {
    volunteer.email = user.email;
  }

  if (isSelf || canAccess('VolunteerInfo', 'roles', profile)) {
    volunteer.roles = user.roles;
  }

  return volunteer;
};

/**
 * Creates a VolunteerInfo object from a User object, stripping fields based on the permissions of the requesting user.
 * @param user The user object from which to create the VolunteerInfo
 * @param permissionsProfile The PermissionsProfile of the currently authenticated user
 * @returns A VolunteerInfo object containing the fields that the requesting user has permission to see.
 */
export function userToVolunteer(user: User, permissionsProfile: PermissionsProfile): VolunteerInfo {
  return stripPII(user, permissionsProfile);
}

/**
 * Converts an array of User objects to an array of VolunteerInfo objects, stripping fields based on the permissions of the requesting user.
 * @param users An array of User objects to convert to VolunteerInfo objects
 * @param permissionsProfile The PermissionsProfile of the currently authenticated user
 * @returns An array of VolunteerInfo objects
 */
export function usersToVolunteers(
  users: User[],
  permissionsProfile: PermissionsProfile
): VolunteerInfo[] {
  return users.map((user) => stripPII(user, permissionsProfile));
}

/**
 * Wrapper for getUser that handles nulls and VolunteerInfo conversion
 * @param userId The ID of the user for which to retrieve volunteer information
 * @param permissionsProfile The PermissionsProfile of the currently authenticated user
 * @returns A VolunteerInfo object for the specified user, or null if the user does not exist or no userId is provided
 */
export async function getVolunteerById(
  userId: string | null,
  permissionsProfile: PermissionsProfile
): Promise<VolunteerInfo | null> {
  if (!userId) {
    return null;
  }
  const user = await getUser(userId);
  return user ? stripPII(user, permissionsProfile) : null;
}
