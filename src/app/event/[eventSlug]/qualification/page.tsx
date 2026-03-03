import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import {
  createQualification,
  getQualificationsForEvent,
  updateQualification
} from '@/service/qualification-service';
import { getTeamsForEvent } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import QualificationList from '@/ui/qualification-list';
import { getQualificationsPath } from '@/utils/path';
import { validateNewQualification } from '@/validator/qualification-validator';
import { Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

const PAGE_KEY = 'QualificationsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = eventSlug ? await getEventBySlug(eventSlug) : null;
    const t = await getTranslations(PAGE_KEY);
    return t('title', { eventName: event?.name ?? '' });
  }
});

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function QualificationsPage({ params }: Props) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    return notFound();
  }

  const editorRoles: UserRoleMatchCriteria[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: event.id }
  ];
  const editable = await checkAuthorisation(editorRoles);

  const teams = await getTeamsForEvent(event.id);
  const qualifications = await getQualificationsForEvent(event.id);

  const onSave = async (data: FormData) => {
    'use server';
    const qualWithoutId = validateNewQualification(data);
    const authorisedRoles: UserRole[] = [
      { type: 'admin' },
      { type: 'organiser', eventId: event.id }
    ];
    if (qualWithoutId.teamId) {
      authorisedRoles.push({ type: 'team-lead', eventId: event.id, teamId: qualWithoutId.teamId });
    }
    await checkAuthorisation(authorisedRoles);

    if (data.has('id')) {
      await updateQualification({
        id: data.get('id')!.toString(),
        ...qualWithoutId
      });
    } else {
      await createQualification(qualWithoutId);
    }

    const path = getQualificationsPath(event.slug);
    revalidatePath(path);
    redirect(path);
  };

  return (
    <Box p="4">
      <QualificationList
        qualifications={qualifications}
        event={event}
        teams={teams}
        onSave={editable ? onSave : undefined}
      />
    </Box>
  );
}
