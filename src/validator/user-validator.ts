/**
 * Form Validators for Users
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

/**
 * Validates FormData for a user ID.
 * @param data - FormData to validate
 * @param fieldName - Optional field name for user ID
 * @returns - Validated user ID string
 * @throws - Error if validation fails
 */
export const validateUserId = (data: FormData, fieldName?: string): string => {
  const userId = data.get(fieldName ?? 'userId')?.toString() ?? null;
  if (!userId) {
    throw new Error(`${fieldName ?? 'User ID'} is required`);
  }
  return userId;
};
