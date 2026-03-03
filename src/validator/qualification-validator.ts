/**
 * Form validators for Qualifications
 * @since 2026-03-03
 * @author Michael Townsend <@continuities>
 */

/**
 * Validates FormData for creating a new qualification, so ID field is not permitted.
 * @param data - FormData to validate
 * @returns - Validated QualificationInfo object without ID
 * @throws - Error if validation fails
 */
export const validateNewQualification = (data: FormData): Omit<QualificationInfo, 'id'> => {
  const name = data.get('name')?.toString() ?? null;
  if (!name) {
    throw new Error('Qualification name is required');
  }

  const eventId = data.get('eventId')?.toString() ?? null;
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  // The form submits the string "null" when no team is selected, so that will be our default
  const teamId = data.get('teamId')?.toString() ?? 'null';

  const errorMessage = data.get('errorMessage')?.toString() ?? null;
  if (!errorMessage) {
    throw new Error('Error message is required');
  }

  return {
    name,
    eventId,
    teamId: teamId.toLowerCase() === 'null' ? undefined : teamId,
    errorMessage
  };
};

/**
 * Validates FormData for updating an existing qualification, so ID field is required.
 * @param data - FormData to validate
 * @returns - Validated QualificationInfo object
 * @throws - Error if validation fails
 */
export const validateExistingQualification = (data: FormData): QualificationInfo => {
  const id = data.get('id')?.toString() ?? null;
  if (!id) {
    throw new Error('Qualification ID is required');
  }
  const qualificationWithoutId = validateNewQualification(data);
  return {
    id,
    ...qualificationWithoutId
  };
};
