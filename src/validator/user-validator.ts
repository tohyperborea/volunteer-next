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

/**
 * Validates FormData for creating a new user, so ID field is not permitted.
 * @param data - FormData to validate
 * @returns - Validated user data without ID
 * @throws - Error if validation fails
 */
export const validateNewUser = (data: FormData): Omit<User, 'id' | 'roles' | 'deletedAt'> => {
  const name = data.get('name')?.toString() ?? null;
  if (!name) {
    throw new Error('User name is required');
  }
  const email = data.get('email')?.toString() ?? null;
  if (!email) {
    throw new Error('User email is required');
  }
  return {
    name,
    email
  };
};

/**
 * Validates FormData for updating an existing user.
 * @param data - FormData to validate
 * @returns - Validated user data with ID
 * @throws - Error if validation fails
 */
export const validateExistingUser = (data: FormData): Pick<User, 'id' | 'name' | 'email'> => {
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
