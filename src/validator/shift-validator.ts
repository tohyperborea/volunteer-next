/**
 * Form validators for Shifts
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

import { stringToTime } from '@/utils/datetime';

/**
 * Get a TeamId from FormData for a Shift
 * @param data - FormData for a Shift
 * @returns - TeamId for the saved Shift, or null if not present
 */
export const getShiftTeamId = (data: FormData): TeamId | null =>
  data.get('teamId')?.toString() ?? null;

/**
 * Validates FormData for updating an existing shift, so 'id' field is required.
 * @param data - FormData to validate, must include 'id' field
 * @returns - Validated ShiftInfo object
 * @throws - Error if validation fails
 */
export const validateExistingShift = (data: FormData): ShiftInfo => {
  const id = data.get('id')?.toString() ?? null;
  if (!id) {
    throw new Error('Shift ID is required');
  }
  const shiftWithoutId = validateNewShift(data);
  return {
    id,
    ...shiftWithoutId
  };
};

/**
 * Validates FormData for creating a new shift, so 'id' field is not permitted.
 * @param data - FormData to validate, must not include 'id' field
 * @returns - Validated ShiftInfo object without 'id'
 * @throws - Error if validation fails
 */
export const validateNewShift = (data: FormData): Omit<ShiftInfo, 'id'> => {
  const teamId = getShiftTeamId(data);
  if (!teamId) {
    throw new Error('Shift teamId is required');
  }
  const title = data.get('title')?.toString() ?? null;
  if (!title) {
    throw new Error('Shift title is required');
  }
  const eventDayStr = data.get('shift-day')?.toString() ?? null;
  if (!eventDayStr) {
    throw new Error('Shift day is required');
  }
  const eventDay = parseInt(eventDayStr, 10);
  if (isNaN(eventDay)) {
    throw new Error('Shift day must be a valid number');
  }
  const startTime = data.get('shift-time')?.toString() ?? null;
  if (!startTime) {
    throw new Error('Shift time is required');
  }
  const durationHoursStr = data.get('durationHours')?.toString() ?? null;
  if (!durationHoursStr) {
    throw new Error('Shift durationHours is required');
  }
  const durationHours = parseInt(durationHoursStr, 10);
  if (isNaN(durationHours) || durationHours <= 0) {
    throw new Error('Shift durationHours must be a positive number');
  }
  const minVolunteersStr = data.get('minVolunteers')?.toString() ?? null;
  if (!minVolunteersStr) {
    throw new Error('Shift minVolunteers is required');
  }
  const minVolunteers = parseInt(minVolunteersStr, 10);
  if (isNaN(minVolunteers) || minVolunteers < 0) {
    throw new Error('Shift minVolunteers must be a non-negative integer');
  }
  const maxVolunteersStr = data.get('maxVolunteers')?.toString() ?? null;
  if (!maxVolunteersStr) {
    throw new Error('Shift maxVolunteers is required');
  }
  const maxVolunteers = parseInt(maxVolunteersStr, 10);
  if (isNaN(maxVolunteers) || maxVolunteers < minVolunteers || maxVolunteers <= 0) {
    throw new Error(
      'Shift maxVolunteers must be an integer greater than or equal to minVolunteers'
    );
  }
  const isActiveStr = data.get('isActive')?.toString() ?? null;
  const isActive = isActiveStr === 'on';

  // The form submits one requirements value per checked box but leave handling for any stale "null" values
  const requirements = data
    .getAll('requirements')
    .map((value) => value.toString())
    .filter((value) => value && value.toLowerCase() !== 'null');

  const shift: Omit<ShiftInfo, 'id'> = {
    teamId,
    title,
    eventDay,
    startTime: stringToTime(startTime),
    durationHours,
    minVolunteers,
    maxVolunteers,
    isActive,
    requirements
  };

  return shift;
};
