import { getUser } from '@/service/user-service';

/**
 * Creates a VolunteerInfo object from a User object, stripping fields based on the permissions of the requesting user.
 * @param user The user object from which to create the VolunteerInfo
 * @returns A VolunteerInfo object containing the fields that the requesting user has permission to see.
 */
export default function Volunteer(user: User): VolunteerInfo {
  // TODO: Authorisation and filtering of fields based on permissions
  return {
    id: user.id,
    displayName: user.name,
    email: user.email,
    fullName: user.name,
    roles: user.roles
  };
}

/**
 * Wrapper for getUser that handles nulls and VolunteerInfo conversion
 * @param userId The ID of the user for which to retrieve volunteer information
 * @returns A VolunteerInfo object for the specified user, or null if the user does not exist or no userId is provided
 */
export async function getVolunteer(userId: string | null): Promise<VolunteerInfo | null> {
  if (!userId) {
    return null;
  }
  const user = await getUser(userId);
  return user ? Volunteer(user) : null;
}
