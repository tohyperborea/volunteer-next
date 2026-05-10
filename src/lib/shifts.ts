/**
 * Utility functions related to Shifts
 * @since 2026-05-08
 * @author Michael Townsend <@continuities>
 */

import unauthorized from '@/app/unauthorized';
import { createShift, deleteShift, getShiftById, updateShift } from '@/service/shift-service';
import { getTeamById } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import { hasShiftStarted } from '@/utils/date';
import { getShiftTeamId, validateNewShift } from '@/validator/shift-validator';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

/**
 * Returns a server action for saving a shift, which can be used for both creating and updating shifts.
 * @param props.isEditable Whether the event is currently editable.
 * @param props.event The event the shift belongs to.
 * @param props.redirectUri The URI to redirect to after the action is complete. Can be a string or a function that takes the saved shift and returns a string.
 * @returns A server action that can be used to save a shift.
 */
export const getSaveShiftAction =
  ({
    isEditable,
    event,
    redirectUri
  }: {
    isEditable: boolean;
    event: EventInfo;
    redirectUri: string | ((shift: ShiftInfo) => Promise<string>);
  }) =>
  async (data: FormData) => {
    'use server';
    if (!isEditable) {
      unauthorized();
    }
    const newTeamId = getShiftTeamId(data);
    if (!newTeamId) {
      notFound();
    }
    await checkAuthorisation([
      { type: 'admin' },
      { type: 'organiser', eventId: event.id },
      { type: 'team-lead', eventId: event.id, teamId: newTeamId }
    ]);
    const shift = validateNewShift(data);
    const shiftId = data.get('id')?.toString();
    const existingShift = shiftId ? await getShiftById(shiftId) : null;
    if (existingShift && hasShiftStarted(event, existingShift)) {
      unauthorized();
    }
    const newTeam = await getTeamById(newTeamId);
    if (!newTeam || newTeam.eventId !== event.id) {
      unauthorized();
    }
    if (existingShift && existingShift.teamId !== newTeamId) {
      // We don't currently support moving shifts between teams
      unauthorized();
    }

    const savedShift = shiftId
      ? await updateShift({ id: shiftId, ...shift })
      : await createShift(shift);

    const path = typeof redirectUri === 'string' ? redirectUri : await redirectUri(savedShift);
    revalidatePath(path);
    redirect(path);
  };

/**
 * Returns a server action for deleting a shift.
 * @param props.isEditable Whether the event is currently editable.
 * @param props.event The event the shift belongs to.
 * @param props.redirectUri The URI to revalidate to after the action is complete. Can be a string or a function that takes the deleted shift and returns a string.
 * @returns A server action that can be used to delete a shift.
 */
export const getDeleteShiftAction =
  ({
    isEditable,
    event,
    redirectUri
  }: {
    isEditable: boolean;
    event: EventInfo;
    redirectUri: string | ((shift: ShiftInfo) => Promise<string>);
  }) =>
  async (shiftId: ShiftId) => {
    'use server';
    if (!shiftId) {
      notFound();
    }
    if (!isEditable) {
      unauthorized();
    }
    const shift = await getShiftById(shiftId);
    if (!shift) {
      notFound();
    }
    if (hasShiftStarted(event, shift)) {
      unauthorized();
    }
    const team = await getTeamById(shift.teamId);
    if (!team || team.eventId !== event.id) {
      unauthorized();
    }

    await checkAuthorisation([
      { type: 'admin' },
      { type: 'organiser', eventId: event.id },
      { type: 'team-lead', eventId: event.id, teamId: shift.teamId }
    ]);
    await deleteShift(shiftId);
    const path = typeof redirectUri === 'string' ? redirectUri : await redirectUri(shift);
    revalidatePath(path);
  };
