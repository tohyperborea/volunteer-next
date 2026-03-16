import { getUser } from '@/service/user-service';

interface RoleProfile {
  userId: UserId;
  isAdmin: boolean;
  isOrganiser: boolean;
  isLead: boolean;
}

const getProfileForUser = (user: User | null): RoleProfile => {
  const roles = user?.roles ?? [];
  const userId = user?.id ?? '';
  return {
    userId,
    isAdmin: Boolean(roles.find(({ type }) => type === 'admin')),
    isOrganiser: Boolean(roles.find(({ type }) => type === 'organiser')),
    isLead: Boolean(roles.find(({ type }) => type === 'team-lead'))
  };
};

const nameToDisplayName = (name: string): string => {
  const [first, second] = name.split(' ', 2);
  if (second) {
    return `${first} ${second[0]}.`;
  }
  return first;
};

const stripPII = (user: User, roleProfile: RoleProfile): VolunteerInfo => {
  const volunteer: VolunteerInfo = {
    id: user.id,
    displayName: user.chosenName || nameToDisplayName(user.name),
    roles: user.roles
  };

  const hasFullAccess =
    user.id === roleProfile.userId ||
    roleProfile.isAdmin ||
    roleProfile.isOrganiser ||
    roleProfile.isLead;
  // If the currentUser has full access, save time by skipping the user's role check
  const userRoleProfile = hasFullAccess ? null : getProfileForUser(user);

  // Only show full name to users with full access
  if (hasFullAccess) {
    volunteer.fullName = user.name;
    if (!user.chosenName) {
      volunteer.displayName = user.name;
    }
  }

  // We need to share email addresses of organisers and team leads so people can reach them
  if (hasFullAccess || userRoleProfile?.isLead || userRoleProfile?.isOrganiser) {
    volunteer.email = user.email;
  }

  return volunteer;
};

/**
 * Creates a VolunteerInfo object from a User object, stripping fields based on the permissions of the requesting user.
 * @param user The user object from which to create the VolunteerInfo
 * @param currentUser The currently authenticated user
 * @returns A VolunteerInfo object containing the fields that the requesting user has permission to see.
 */
export function userToVolunteer(user: User, currentUser: User | null): VolunteerInfo {
  return stripPII(user, getProfileForUser(currentUser));
}

/**
 * Converts an array of User objects to an array of VolunteerInfo objects, stripping fields based on the permissions of the requesting user.
 * @param users An array of User objects to convert to VolunteerInfo objects
 * @param currentUser The currently authenticated user
 * @returns An array of VolunteerInfo objects
 */
export function usersToVolunteers(users: User[], currentUser: User | null): VolunteerInfo[] {
  return users.map((user) => stripPII(user, getProfileForUser(currentUser)));
}

/**
 * Wrapper for getUser that handles nulls and VolunteerInfo conversion
 * @param userId The ID of the user for which to retrieve volunteer information
 * @param currentUser The currently authenticated user
 * @returns A VolunteerInfo object for the specified user, or null if the user does not exist or no userId is provided
 */
export async function getVolunteerById(
  userId: string | null,
  currentUser: User | null
): Promise<VolunteerInfo | null> {
  if (!userId) {
    return null;
  }
  const user = await getUser(userId);
  return user ? stripPII(user, getProfileForUser(currentUser)) : null;
}
