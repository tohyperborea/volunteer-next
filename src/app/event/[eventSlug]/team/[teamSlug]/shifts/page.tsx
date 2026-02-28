import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { createShift, updateShift, deleteShift, getShifts } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import ShiftList from '@/ui/shift-list';
import { getTeamShiftsPath } from '@/utils/path';
import { validateNewShift } from '@/validator/shift-validator';
import { getTranslations } from 'next-intl/server';
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

  const shifts = await getShifts(team.id);

  const editorRoles: UserRole[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: team.eventId },
    { type: 'team-lead', eventId: team.eventId, teamId: team.id }
  ];

  const isEditable = await checkAuthorisation(editorRoles, true);

  const onSaveShift = async (data: FormData) => {
    'use server';
    console.log('Saving shift with data:', Object.fromEntries(data.entries()));
    await checkAuthorisation(editorRoles);
    const shift = validateNewShift(data);
    const shiftId = data.get('id')?.toString();
    if (shiftId) {
      await updateShift({ id: shiftId, ...shift });
    } else {
      await createShift(shift);
    }
    redirect(getTeamShiftsPath(eventSlug, teamSlug));
  };

  const onDeleteShift = async (data: FormData) => {
    'use server';
    console.log('Deleting shift with data:', Object.fromEntries(data.entries()));
    await checkAuthorisation(editorRoles);
    const shiftId = data.get('id')?.toString();
    if (!shiftId) {
      throw new Error('Shift id is required for deletion');
    }
    await deleteShift(shiftId);
    redirect(getTeamShiftsPath(eventSlug, teamSlug));
  };

  return (
    <ShiftList
      startDate={event.startDate}
      teamId={team.id}
      shifts={shifts}
      onSaveShift={isEditable ? onSaveShift : undefined}
      onDeleteShift={isEditable ? onDeleteShift : undefined}
    />
  );
}
