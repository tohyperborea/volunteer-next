import metadata from '@/i18n/metadata';
import { getEvents, getEventsById } from '@/service/event-service';
import {
  assignQualificationToUsers,
  getQualificationById,
  getQualificationsForUser,
  removeQualificationFromUser
} from '@/service/qualification-service';
import { getTeamsById, getTeamsForEvents } from '@/service/team-service';
import { getUser } from '@/service/user-service';
import { checkAuthorisation, getMatchingRoles } from '@/session';
import UserQualifications from '@/ui/user-qualifications';
import VolunteerCard from '@/ui/volunteer-card';
import { getUserProfilePath } from '@/utils/path';
import { Button, Flex, Heading, Select } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { getManagedQualifications } from '@/lib/qualification';
import { FormField } from '@/ui/form-dialog';
import { PlusIcon } from '@radix-ui/react-icons';

const PAGE_KEY = 'UserProfilePage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { userId } = params;
    const t = await getTranslations(PAGE_KEY);
    const user = userId ? await getUser(userId) : null;
    return t('title', {
      userName: user?.name ?? ''
    });
  }
});

export default async function UserProfilePage({ params }: PageProps<'/user/[userId]'>) {
  const { userId } = await params;
  const t = await getTranslations(PAGE_KEY);
  const volunteer = userId ? await getUser(userId) : null;
  if (!volunteer) {
    notFound();
  }

  const isAdmin = await checkAuthorisation([{ type: 'admin' }], true);
  const organisesEvents = await getMatchingRoles({ type: 'organiser' }).then((roles) =>
    roles.filter((role) => role.type === 'organiser').map((role) => role.eventId)
  );
  const leadsTeamIds = await getMatchingRoles({ type: 'team-lead' }).then((roles) =>
    roles.filter((role) => role.type === 'team-lead').map((role) => role.teamId)
  );
  const leadsTeams = await getTeamsById(leadsTeamIds);

  const canManageQualifications = isAdmin || organisesEvents.length > 0 || leadsTeams.length > 0;
  const managedQualifications = canManageQualifications
    ? await getManagedQualifications({
        isAdmin,
        organisesEvents,
        leadsTeams: leadsTeamIds
      })
    : [];

  const qualifications = await getQualificationsForUser(userId);

  const eventIds = new Set([
    ...leadsTeams.map((team) => team.eventId),
    ...organisesEvents,
    ...qualifications.map((qualification) => qualification.eventId)
  ]);
  const events = isAdmin ? await getEvents() : await getEventsById([...eventIds]);
  const omitQualificationOptions = new Set(qualifications.map((qualification) => qualification.id));
  const qualificationOptions = managedQualifications.filter(
    (qualification) => !omitQualificationOptions.has(qualification.id)
  );
  const eventNames = events.reduce<Record<EventId, string>>(
    (acc, event) => ({ ...acc, [event.id]: event.name }),
    {}
  );
  const teams = await getTeamsForEvents([...eventIds]);

  const authoriseForQualification = async (qualification: QualificationInfo) => {
    'use server';
    const authorisedRoles: UserRole[] = [
      {
        type: 'admin'
      },
      {
        type: 'organiser',
        eventId: qualification.eventId
      }
    ];
    if (qualification.teamId) {
      authorisedRoles.push({
        type: 'team-lead',
        teamId: qualification.teamId,
        eventId: qualification.eventId
      });
    }
    return checkAuthorisation(authorisedRoles, true);
  };

  const onAdd = async (data: FormData) => {
    'use server';
    const qualificationId = data.get('qualification-id');
    if (typeof qualificationId !== 'string') {
      throw new Error('Invalid qualification ID');
    }
    const qualification = await getQualificationById(qualificationId);
    if (!qualification) {
      throw new Error('Qualification not found');
    }
    await authoriseForQualification(qualification);
    await assignQualificationToUsers(qualificationId, [userId]);
    revalidatePath(getUserProfilePath(userId));
  };

  const onRemove = async (qualificationId: QualificationId) => {
    'use server';
    const qualification = await getQualificationById(qualificationId);
    if (!qualification) {
      throw new Error('Qualification not found');
    }
    await authoriseForQualification(qualification);
    await removeQualificationFromUser(qualificationId, userId);
    revalidatePath(getUserProfilePath(userId));
  };

  return (
    <Flex direction="column" gap="4">
      <VolunteerCard volunteer={volunteer} />
      <Heading as="h2" size="4">
        {t('qualifications')}
      </Heading>
      <UserQualifications
        qualifications={qualifications}
        events={events}
        teams={teams}
        onRemove={onRemove}
        authorised={isAdmin}
        authorisedEvents={organisesEvents}
        authorisedTeams={leadsTeamIds}
      />
      {canManageQualifications && (
        <Flex direction="column" gap="2" asChild>
          <form>
            <FormField
              ariaId={'add-qualification'}
              name={t('addQualification')}
              description={t('addQualificationDescription')}
            >
              <Select.Root
                disabled={qualificationOptions.length === 0}
                key={qualifications.length}
                name="qualification-id"
                required
              >
                <Select.Trigger placeholder={t('select')} aria-labelledby="add-qualification" />
                <Select.Content>
                  {qualificationOptions.map((qualification) => (
                    <Select.Item key={qualification.id} value={qualification.id}>
                      {qualification.name} ({eventNames[qualification.eventId]})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </FormField>
            <Button
              disabled={qualificationOptions.length === 0}
              variant="soft"
              style={{ alignSelf: 'flex-start' }}
              formAction={onAdd}
            >
              <PlusIcon />
              {t('assignQualification')}
            </Button>
          </form>
        </Flex>
      )}
    </Flex>
  );
}
