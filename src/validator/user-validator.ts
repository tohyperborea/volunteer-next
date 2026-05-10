/**
 * Form Validators for Users
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

import { deduplicateBy } from '@/utils/list';

/**
 * Validates FormData for a user ID.
 * @param data - FormData to validate
 * @param fieldName - Optional field name for user ID
 * @returns - Array of validated user ID strings
 * @throws - Error if validation fails
 */
export const validateUserId = (data: FormData, fieldName?: string): string[] => {
  const userId = data.getAll(fieldName ?? 'userId');
  if (!userId || userId.length === 0) {
    throw new Error(`${fieldName ?? 'User ID'} is required`);
  }
  return deduplicateBy(
    userId.map((id) => id.toString().trim()).filter((id) => id.length > 0),
    (id) => id
  );
};

/**
 * Validates FormData for creating a new user, so ID field is not permitted.
 * @param data - FormData to validate
 * @returns - Validated user data without ID
 * @throws - Error if validation fails
 */
export const validateNewUser = (data: FormData): UserCreationModel => {
  const name = data.get('name')?.toString().trim() ?? null;
  if (!name) {
    throw new Error('User name is required');
  }
  const email = data.get('email')?.toString().trim() ?? null;
  if (!email) {
    throw new Error('User email is required');
  }
  const chosenName = data.get('chosenName')?.toString().trim() ?? undefined;
  return {
    name,
    email,
    chosenName: (chosenName?.length ?? 0) ? chosenName : undefined
  };
};

/**
 * Validates FormData for updating an existing user.
 * @param data - FormData to validate
 * @returns - Validated user data with ID
 * @throws - Error if validation fails
 */
export const validateExistingUser = (data: FormData): UserUpdateModel => {
  const id = data.get('id')?.toString() ?? null;
  if (!id) {
    throw new Error('User ID is required');
  }
  const userWithoutId = validateNewUser(data);
  return {
    id,
    ...userWithoutId
  };
};
