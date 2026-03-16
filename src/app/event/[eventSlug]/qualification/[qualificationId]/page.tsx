import metadata from '@/i18n/metadata';
import { usersToVolunteers } from '@/lib/volunteer';
import { getEventBySlug } from '@/service/event-service';
import {
  assignQualificationToUsers,
  deleteQualification,
  getQualificationById,
  removeQualificationFromUser,
  updateQualification
} from '@/service/qualification-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getFilteredUsers } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import AssignQualification from '@/ui/assign-qualification';
import QualificationDetails from '@/ui/qualification-details';
import VolunteerList from '@/ui/volunteer-list';
import { getQualificationDetailsPath, getQualificationsPath } from '@/utils/path';
import { validateExistingQualification } from '@/validator/qualification-validator';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Flex, Heading, IconButton } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

const PAGE_KEY = 'QualificationDetailsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug, qualificationId } = params;
    const event = eventSlug ? await getEventBySlug(eventSlug) : null;
    const qualification = qualificationId ? await getQualificationById(qualificationId) : null;
    const t = await getTranslations(PAGE_KEY);
    return t('title', {
      qualificationName: qualification?.name ?? '',
      eventName: event?.name ?? ''
    });
  }
});

interface Props {
  params: Promise<{ eventSlug: string; qualificationId: QualificationId }>;
  searchParams?: Promise<{
    searchQuery?: string;
    page?: string;
  }>;
}

export default async function QualificationsPage(props: Props) {
  const { eventSlug, qualificationId } = await props.params;
  const searchParams = await props.searchParams;
  const query = searchParams?.searchQuery;
  const t = await getTranslations(PAGE_KEY);
  const event = await getEventBySlug(eventSlug);
  const qualification = await getQualificationById(qualificationId);
  if (!event || !qualification || qualification.eventId !== event.id) {
    return notFound();
  }
  const teams = await getTeamsForEvent(event.id);
  const volunteers = usersToVolunteers(
    await getFilteredUsers({
      withQualification: qualification.id,
      searchQuery: query
    }),
    await currentUser()
  );

  const editorRoles: UserRole[] = [
    {
      type: 'admin'
    },
    {
      type: 'organiser',
      eventId: event.id
    }
  ];
  if (qualification.teamId) {
    editorRoles.push({
      type: 'team-lead',
      eventId: event.id,
      teamId: qualification.teamId
    });
  }
  const editable = await checkAuthorisation(editorRoles, true);

  const onSave = async (data: FormData) => {
    'use server';
    await checkAuthorisation(editorRoles);
    const updatedQualification = validateExistingQualification(data);
    await updateQualification(updatedQualification);

    const path = getQualificationDetailsPath({ eventSlug, qualificationId });
    revalidatePath(path);
    redirect(path);
  };

  const onDelete = async () => {
    'use server';
    await checkAuthorisation(editorRoles);
    await deleteQualification(qualification.id);

    const path = getQualificationsPath(event.slug);
    revalidatePath(path);
    redirect(path);
  };

  const onAssignQualification = async (data: FormData) => {
    'use server';
    const volunteerIds = data.getAll('volunteers') as UserId[];
    await checkAuthorisation(editorRoles);
    await assignQualificationToUsers(qualification.id, volunteerIds);
    const path = getQualificationDetailsPath({ eventSlug, qualificationId });
    revalidatePath(path);
    redirect(path);
  };

  const onRemoveQualification = async (volunteerId: UserId) => {
    'use server';
    if (!volunteerId) {
      throw new Error('Volunteer ID is required');
    }
    await checkAuthorisation(editorRoles);
    await removeQualificationFromUser(qualification.id, volunteerId);
    const path = getQualificationDetailsPath({ eventSlug, qualificationId });
    revalidatePath(path);
  };

  const itemActions = editable
    ? volunteers.reduce(
        (actions, volunteer) => {
          actions[volunteer.id] = (
            <IconButton
              variant="ghost"
              color="red"
              onClick={onRemoveQualification.bind(null, volunteer.id)}
              aria-label={t('remove', { name: volunteer.displayName })}
              title={t('remove', { name: volunteer.displayName })}
            >
              <Cross1Icon />
            </IconButton>
          );
          return actions;
        },
        {} as Record<UserId, React.ReactNode>
      )
    : undefined;

  return (
    <Flex direction="column" gap="6">
      <QualificationDetails
        qualification={qualification}
        event={event}
        teams={teams}
        onSave={editable ? onSave : undefined}
        onDelete={editable ? onDelete : undefined}
      />
      <Heading size="3" as="h2">
        {t('volunteers')}
      </Heading>
      {editable && (
        <AssignQualification qualification={qualification} onSubmit={onAssignQualification} />
      )}
      <VolunteerList
        volunteers={volunteers}
        itemActions={itemActions}
        withFilters={['searchQuery']}
      />
    </Flex>
  );
}
