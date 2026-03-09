import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import {
  createQualification,
  getQualificationsForEvent,
  updateQualification
} from '@/service/qualification-service';
import { getTeamsForEvent } from '@/service/team-service';
import { checkAuthorisation, getMatchingRoles } from '@/session';
import ManageQualifications from '@/ui/manage-qualifications';
import { getQualificationsPath } from '@/utils/path';
import { validateNewQualification } from '@/validator/qualification-validator';
import { Flex, Heading } from '@radix-ui/themes';
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
  const t = await getTranslations(PAGE_KEY);
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    return notFound();
  }

  const editorRoles: UserRoleMatchCriteria[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: event.id }
  ];
  const canEditAll = await checkAuthorisation(editorRoles, true);
  const editableTeams = canEditAll
    ? undefined
    : await getMatchingRoles({ type: 'team-lead', eventId: event.id }).then((roles) =>
        roles.filter((role) => role.type === 'team-lead').map((role) => role.teamId)
      );
  const editable = Boolean(editableTeams?.length) || canEditAll;

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
    <Flex direction="column" gap="6">
      <Heading size="5" as="h1">
        {t('title', { eventName: event?.name ?? '' })}
      </Heading>

      <ManageQualifications
        qualifications={qualifications}
        event={event}
        teams={teams}
        editableTeams={editableTeams}
        onSave={editable ? onSave : undefined}
      />
    </Flex>
  );
}
