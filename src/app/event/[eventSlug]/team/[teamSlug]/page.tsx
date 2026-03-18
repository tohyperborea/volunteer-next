import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { getQualificationsForEvent } from '@/service/qualification-service';
import { createShift, updateShift, deleteShift, getShiftsForTeam } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import ShiftList from '@/ui/shift-list';
import { getTeamShiftsApiPath, getTeamShiftsPath } from '@/utils/path';
import { validateNewShift } from '@/validator/shift-validator';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

const PAGE_KEY = 'TeamPage.ShiftsTab';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const t = await getTranslations(PAGE_KEY);
    const { eventSlug, teamSlug } = params;
    const team = !eventSlug || !teamSlug ? null : await getTeamBySlug(eventSlug, teamSlug);
    return `${t('title')} | ${team?.name ?? ''}`;
  }
});

interface Props {
  params: Promise<{ eventSlug: string; teamSlug: string }>;
}

export default async function TeamShifts({ params }: Props) {
  const { eventSlug, teamSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  const team = await getTeamBySlug(eventSlug, teamSlug);
  if (!event || !team) {
    notFound();
  }

  const qualifications = await getQualificationsForEvent(team.eventId).then((quals) =>
    quals.filter((q) => !q.teamId || q.teamId === team.id)
  );
  const shifts = await getShiftsForTeam(team.id);
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
    const path = getTeamShiftsPath(eventSlug, teamSlug);
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
    const path = getTeamShiftsPath(eventSlug, teamSlug);
    revalidatePath(path);
  };

  return (
    <Flex direction="column" gap="2">
      <Heading my="4" as="h2">
        {t('title')}
      </Heading>
      <ShiftList
        event={event}
        startDate={event.startDate}
        teamId={team.id}
        shifts={shifts}
        qualifications={qualifications}
        exportLink={getTeamShiftsApiPath(eventSlug, teamSlug, { format: 'csv' })}
        onSaveShift={isEditable ? onSaveShift : undefined}
        onDeleteShift={isEditable ? onDeleteShift : undefined}
      />
    </Flex>
  );
}
