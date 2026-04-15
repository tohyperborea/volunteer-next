/**
 * Form Validators for Events
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

export const EVENT_SLUG_REGEX = /^[a-zA-Z0-9\-_]*$/;
export const EVENT_SLUG_PATTERN = EVENT_SLUG_REGEX.source.substring(1);

/**
 * Validates FormData for updating an event.
 * @param data - FormData to validate
 * @returns - Validated EventInfo object
 * @throws - Error if validation fails
 */
export const validateExistingEvent = (data: FormData): EventInfo => {
  const id = data.get('id')?.toString() ?? null;
  if (!id) {
    throw new Error('Event ID is required');
  }
  const eventWithoutId = validateNewEvent(data);
  return {
    id,
    ...eventWithoutId
  };
};

/**
 * Validates FormData for creating a new event, so ID field is not permitted.
 * @param data - FormData to validate
 * @returns - Validated EventInfo object without ID
 * @throws - Error if validation fails
 */
export const validateNewEvent = (data: FormData): Omit<EventInfo, 'id'> => {
  const name = data.get('name')?.toString() ?? null;
  if (!name) {
    throw new Error('Event name is required');
  }
  const slug = data.get('slug')?.toString() ?? null;
  if (!slug) {
    throw new Error('Event slug is required');
  }
  if (EVENT_SLUG_REGEX.test(slug) === false) {
    throw new Error('Event slug contains invalid characters');
  }
  const startDateString = data.get('startDate')?.toString() ?? null;
  if (!startDateString) {
    throw new Error('Start date is required');
  }
  const endDateString = data.get('endDate')?.toString() ?? null;
  if (!endDateString) {
    throw new Error('End date is required');
  }

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  if (endDate < startDate) {
    throw new Error('End date cannot be before start date');
  }

  const logo = data.get('logo')?.toString() ?? undefined;
  const favicon = data.get('favicon')?.toString() ?? undefined;

  return {
    slug,
    name,
    startDate,
    endDate,
    logo,
    favicon
  };
};
