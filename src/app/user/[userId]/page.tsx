import metadata from '@/i18n/metadata';
import { getEventsById } from '@/service/event-service';
import {
  getQualificationById,
  getQualificationsForUser,
  removeQualificationFromUser
} from '@/service/qualification-service';
import { getTeamsForEvents } from '@/service/team-service';
import { getUser } from '@/service/user-service';
import { checkAuthorisation, getMatchingRoles } from '@/session';
import UserQualifications from '@/ui/user-qualifications';
import VolunteerCard from '@/ui/volunteer-card';
import { getUserProfilePath } from '@/utils/path';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

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
  const leadsTeams = await getMatchingRoles({ type: 'team-lead' }).then((roles) =>
    roles.filter((role) => role.type === 'team-lead').map((role) => role.teamId)
  );

  const qualifications = await getQualificationsForUser(userId);
  const eventIds = [...new Set(qualifications.map((qualification) => qualification.eventId))];
  const events = await getEventsById(eventIds);
  const teams = await getTeamsForEvents(eventIds);

  const onRemove = async (qualificationId: QualificationId) => {
    'use server';
    const qualification = await getQualificationById(qualificationId);
    if (!qualification) {
      throw new Error('Qualification not found');
    }
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
    await checkAuthorisation(authorisedRoles);
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
        authorisedTeams={leadsTeams}
      />
    </Flex>
  );
}
