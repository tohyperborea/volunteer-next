import metadata from '@/i18n/metadata';
import {
  createQualification,
  getQualificationsForEvent,
  updateQualification
} from '@/service/qualification-service';
import { getTeamsForEvent } from '@/service/team-service';
import {
  checkAuthorisation,
  getCurrentEvent,
  getCurrentEventOrRedirect,
  getMatchingRoles
} from '@/session';
import ManageQualifications from '@/ui/manage-qualifications';
import { getQualificationsPath } from '@/utils/path';
import {
  parseTeamId,
  validateExistingQualification,
  validateNewQualification
} from '@/validator/qualification-validator';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

const PAGE_KEY = 'QualificationsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async () => {
    const event = await getCurrentEvent();
    const t = await getTranslations(PAGE_KEY);
    return t('title', { eventName: event?.name ?? '' });
  }
});

export default async function QualificationsPage() {
  const t = await getTranslations(PAGE_KEY);
  const event = await getCurrentEventOrRedirect();

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

  const checkQualificationAuthorisation = async (data: FormData) => {
    'use server';
    const teamId = parseTeamId(data);
    const authorisedRoles: UserRole[] = [
      { type: 'admin' },
      { type: 'organiser', eventId: event.id }
    ];
    if (teamId) {
      authorisedRoles.push({ type: 'team-lead', eventId: event.id, teamId });
    }
    await checkAuthorisation(authorisedRoles);
  };

  const onCreate = async (data: FormData) => {
    'use server';
    await checkQualificationAuthorisation(data);
    const qualification = validateNewQualification(data);
    await createQualification(qualification);
    const path = getQualificationsPath();
    revalidatePath(path);
    redirect(path);
  };

  const onUpdate = async (data: FormData) => {
    'use server';
    await checkQualificationAuthorisation(data);
    const qualification = validateExistingQualification(data);
    await updateQualification(qualification);
    const path = getQualificationsPath();
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
        onCreate={editable ? onCreate : undefined}
        onUpdate={editable ? onUpdate : undefined}
      />
    </Flex>
  );
}
