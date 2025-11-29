/**
 * Form Validators for Teams
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

/**
 * Validates FormData for updating a team.
 * @param data - FormData to validate
 * @returns - Validated TeamInfo object
 * @throws - Error if validation fails
 */
export const validateExistingTeam = (data: FormData): TeamInfo => {
  const id = data.get('id')?.toString() ?? null;
  if (!id) {
    throw new Error('Team ID is required');
  }
  const teamWithoutId = validateNewTeam(data);
  return {
    id,
    ...teamWithoutId
  };
};

/**
 * Validates FormData for creating a new team, so ID field is not permitted.
 * @param data - FormData to validate
 * @returns - Validated TeamInfo object without ID
 * @throws - Error if validation fails
 */
export const validateNewTeam = (data: FormData): Omit<TeamInfo, 'id'> => {
  const name = data.get('name')?.toString() ?? null;
  if (!name) {
    throw new Error('Team name is required');
  }
  const slug = data.get('slug')?.toString() ?? null;
  if (!slug) {
    throw new Error('Team slug is required');
  }
  const description = data.get('description')?.toString() ?? null;
  if (!description) {
    throw new Error('Team description is required');
  }
  const eventId = data.get('eventId')?.toString() ?? null;
  if (!eventId) {
    throw new Error('Team eventId is required');
  }
  return {
    eventId,
    slug,
    name,
    description
  };
};
