import { inTransaction } from '@/db';
import metadata from '@/i18n/metadata';
import { sendUserShiftEmail } from '@/lib/email';
import {
  getQualificationsForEvent,
  getQualificationsForUser
} from '@/service/qualification-service';
import {
  createShift,
  updateShift,
  deleteShift,
  getFilteredShiftsForTeam,
  addVolunteerToShift,
  removeVolunteerFromShift,
  getShiftsForVolunteer,
  getShiftById,
  getShiftLock,
  getShiftSignupCount
} from '@/service/shift-service';
import { getTeamBySlug, getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import {
  checkAuthorisation,
  currentUser,
  getCurrentEvent,
  getCurrentEventOrRedirect
} from '@/session';
import ShiftList from '@/ui/shift-list';
import { getTeamShiftsApiPath, getTeamShiftsPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { recordToShiftFilters } from '@/utils/shift-filters';
import { validateNewShift } from '@/validator/shift-validator';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect, unauthorized } from 'next/navigation';

const PAGE_KEY = 'TeamPage.ShiftsTab';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { teamSlug } = params;
    const t = await getTranslations(PAGE_KEY);
    const event = await getCurrentEvent();
    const team = !event || !teamSlug ? null : await getTeamBySlug(event.slug, teamSlug);
    return `${t('title')} | ${team?.name ?? ''}`;
  }
});

export default async function TeamPage({ params, searchParams }: PageProps<`/team/[teamSlug]`>) {
  const { teamSlug } = await params;
  const event = await getCurrentEventOrRedirect();
  const team = teamSlug ? await getTeamBySlug(event.slug, teamSlug) : null;

  if (!team) {
    notFound();
  }

  const filters = recordToShiftFilters(await searchParams);
  const qualifications = await getQualificationsForEvent(team.eventId).then((quals) =>
    quals.filter((q) => !q.teamId || q.teamId === team.id)
  );
  const shifts = await getFilteredShiftsForTeam(team.id, filters);
  shifts.sort((a, b) => {
    const dayDiff = a.eventDay - b.eventDay;
    if (dayDiff !== 0) {
      return dayDiff;
    }
    return a.startTime.localeCompare(b.startTime);
  });

  const editorRoles: UserRole[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: team.eventId },
    { type: 'team-lead', eventId: team.eventId, teamId: team.id }
  ];

  const isEditable = await checkAuthorisation(editorRoles, true);
  const t = await getTranslations(PAGE_KEY);
  const user = (await currentUser())!; // checkAuthorisation guarantees this is not null
  const permissions = getPermissionsProfile(user);
  const shiftVolunteers = await getVolunteersForShifts(
    shifts.map((s) => s.id),
    permissions
  );
  const userShifts = new Set(
    (await getShiftsForVolunteer(event.id, permissions.userId)).map((s) => s.id)
  );
  const userQualifications = new Set(
    (await getQualificationsForUser(permissions.userId)).map((q) => q.id)
  );

  const onSaveShift = async (data: FormData) => {
    'use server';
    console.info('Saving shift with data:', Object.fromEntries(data.entries()));
    await checkAuthorisation(editorRoles);
    const shift = validateNewShift(data);
    const shiftId = data.get('id')?.toString();
    if (shiftId) {
      await updateShift({ id: shiftId, ...shift });
    } else {
      await createShift(shift);
    }
    const path = getTeamShiftsPath(teamSlug);
    revalidatePath(path);
    redirect(path);
  };

  const onDeleteShift = async (shiftId: ShiftId) => {
    'use server';
    console.info('Deleting shiftId: ', shiftId);
    await checkAuthorisation(editorRoles);
    if (!shiftId) {
      throw new Error('Shift id is required for deletion');
    }
    await deleteShift(shiftId);
    const path = getTeamShiftsPath(teamSlug);
    revalidatePath(path);
  };

  const onSignup = async (shiftId: ShiftId) => {
    'use server';
    console.info(`Signing up volunteer ${permissions.userId} for shift ${shiftId}`);
    if (!permissions.userId) {
      unauthorized();
    }
    const shift = await getShiftById(shiftId);
    if (!shift) {
      notFound();
    }
    if (shift.teamId !== team.id) {
      throw new Error('Shift does not belong to this team');
    }

    if (shift.requirement) {
      const qualifications = await getQualificationsForUser(permissions.userId);
      const hasRequiredQualification = qualifications.some((q) => q.id === shift.requirement);
      if (!hasRequiredQualification) {
        throw new Error('User does not have the required qualification for this shift');
      }
    }

    await inTransaction(async (client) => {
      await getShiftLock(shiftId, client);
      const numVolunteers = await getShiftSignupCount(shiftId, client);
      if (numVolunteers >= shift.maxVolunteers) {
        throw new Error('Shift is already full');
      }
      await addVolunteerToShift(shiftId, permissions.userId, client);
      const teams = await getTeamsForEvent(event.id);
      const shifts = await getShiftsForVolunteer(event.id, permissions.userId);
      await sendUserShiftEmail({
        event,
        user,
        shifts,
        teams
      });
    });
    const path = getTeamShiftsPath(teamSlug);
    revalidatePath(path);
  };

  const onCancel = async (shiftId: ShiftId) => {
    'use server';
    console.info(`Cancelling volunteer ${permissions.userId} for shift ${shiftId}`);
    if (!permissions.userId) {
      unauthorized();
    }
    await removeVolunteerFromShift(shiftId, permissions.userId);
    const path = getTeamShiftsPath(teamSlug);
    revalidatePath(path);
  };

  return (
    <Flex direction="column" gap="2">
      {!isEditable && (
        <Heading my="4" as="h2">
          {t('title')}
        </Heading>
      )}
      <ShiftList
        event={event}
        teamId={team.id}
        shifts={shifts}
        userShifts={userShifts}
        userQualifications={userQualifications}
        qualifications={qualifications}
        shiftVolunteers={shiftVolunteers}
        exportLink={getTeamShiftsApiPath(event.slug, teamSlug, { format: 'csv' })}
        onSaveShift={isEditable ? onSaveShift : undefined}
        onDeleteShift={isEditable ? onDeleteShift : undefined}
        onSignup={onSignup}
        onCancel={onCancel}
      />
    </Flex>
  );
}
