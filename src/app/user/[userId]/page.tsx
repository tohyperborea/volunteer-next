import metadata from '@/i18n/metadata';
import {
  assignQualificationToUsers,
  getQualificationById,
  getQualificationsForUser,
  removeQualificationFromUser
} from '@/service/qualification-service';
import { getTeamsById, getTeamsForEvent } from '@/service/team-service';
import { checkAuthorisation, currentUser, getCurrentEvent, getMatchingRoles } from '@/session';
import UserQualifications from '@/ui/user-qualifications';
import VolunteerCard from '@/ui/volunteer-card';
import { getEditUserPath, getUserProfilePath } from '@/utils/path';
import { Box, Button, Flex, Heading, IconButton, Select } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { getManagedQualifications } from '@/lib/qualification';
import { FormField } from '@/ui/form-dialog';
import { ExitIcon, Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { getVolunteerById } from '@/lib/volunteer';
import { getPermissionsProfile } from '@/utils/permissions';
import { auth, signOut } from '@/auth';
import { headers } from 'next/headers';
import NextLink from 'next/link';
import { hasEventEnded } from '@/utils/date';

const PAGE_KEY = 'VolunteerProfilePage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { userId } = params;
    const t = await getTranslations(PAGE_KEY);
    const permissionsProfile = getPermissionsProfile(await currentUser());
    const event = await getCurrentEvent();
    const user = await getVolunteerById(userId ?? null, event?.id ?? null, permissionsProfile);
    return t('title', {
      name: user?.displayName ?? ''
    });
  }
});

export default async function VolunteerProfilePage({ params }: PageProps<'/user/[userId]'>) {
  const { userId } = await params;
  const t = await getTranslations(PAGE_KEY);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const event = await getCurrentEvent();

  const volunteer = await getVolunteerById(userId, event?.id ?? null, permissionsProfile);
  if (!volunteer) {
    notFound();
  }

  const isAdmin = await checkAuthorisation([{ type: 'admin' }], true);
  const isOwnProfile = volunteer.id === permissionsProfile.userId;
  const organisesEvent =
    event !== null && (await checkAuthorisation([{ type: 'organiser', eventId: event.id }], true));
  const leadsTeamIds = event
    ? await getMatchingRoles({ type: 'team-lead', eventId: event.id }).then((roles) =>
        roles.filter((role) => role.type === 'team-lead').map((role) => role.teamId)
      )
    : [];
  const leadsTeams = await getTeamsById(leadsTeamIds);

  const canManageQualifications =
    event && !hasEventEnded(event) && (isAdmin || organisesEvent || leadsTeams.length > 0);
  const managedQualifications = canManageQualifications
    ? await getManagedQualifications({
        event,
        isAdmin,
        organisesEvent,
        leadsTeams: leadsTeamIds
      })
    : [];
  const managedQualificationIds = new Set(
    managedQualifications.map((qualification) => qualification.id)
  );

  const qualifications = event ? await getQualificationsForUser(userId, event.id) : [];

  const omitQualificationOptions = new Set(qualifications.map((qualification) => qualification.id));
  const qualificationOptions = managedQualifications.filter(
    (qualification) => !omitQualificationOptions.has(qualification.id)
  );
  const teams = event ? await getTeamsForEvent(event.id) : [];

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
    if (!managedQualificationIds.has(qualificationId) || (event && hasEventEnded(event))) {
      unauthorized();
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
    if (!managedQualificationIds.has(qualificationId) || (event && hasEventEnded(event))) {
      unauthorized();
    }
    const qualification = await getQualificationById(qualificationId);
    if (!qualification) {
      throw new Error('Qualification not found');
    }
    await authoriseForQualification(qualification);
    await removeQualificationFromUser(qualificationId, userId);
    revalidatePath(getUserProfilePath(userId));
  };

  const signOutAction = async () => {
    'use server';
    const redirectUrl = await signOut(await headers());
    redirect(redirectUrl);
  };

  return (
    <Flex direction="column" gap="4" my="4">
      <VolunteerCard
        volunteer={volunteer}
        actions={
          (isOwnProfile || isAdmin) && (
            <IconButton asChild variant="ghost" aria-label={t('edit')} title={t('edit')}>
              <NextLink href={getEditUserPath(volunteer.id, getUserProfilePath(volunteer.id))}>
                <Pencil2Icon width={20} height={20} />
              </NextLink>
            </IconButton>
          )
        }
      />
      {isOwnProfile && (
        <Box mt="4">
          <Button
            variant="soft"
            color="red"
            onClick={signOutAction}
            data-umami-event="Sign out"
            data-umami-event-userid={volunteer.id}
          >
            <ExitIcon />
            {t('signOut')}
          </Button>
        </Box>
      )}
      {event && (
        <>
          <Heading as="h2" size="4" mt="4">
            {t('qualifications')}
          </Heading>
          <UserQualifications
            qualifications={qualifications}
            event={event}
            teams={teams}
            onRemove={onRemove}
            managedQualificationIds={managedQualificationIds}
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
                          {qualification.name}
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
        </>
      )}
    </Flex>
  );
}
