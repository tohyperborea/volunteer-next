import metadata from '@/i18n/metadata';
import { getEventsById } from '@/service/event-service';
import { getQualificationsForUser } from '@/service/qualification-service';
import { getTeamsForEvents } from '@/service/team-service';
import { getUser } from '@/service/user-service';
import Collapsible from '@/ui/collapsible';
import QualificationList from '@/ui/qualification-list';
import VolunteerCard from '@/ui/volunteer-card';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

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
  const user = userId ? await getUser(userId) : null;
  if (!user) {
    notFound();
  }
  const qualifications = await getQualificationsForUser(userId);
  const eventIds = [...new Set(qualifications.map((qualification) => qualification.eventId))];
  const events = await getEventsById(eventIds);
  const teams = await getTeamsForEvents(eventIds);

  return (
    <Flex direction="column" gap="4">
      <VolunteerCard volunteer={user} />
      <Heading as="h2" size="4">
        {t('qualifications')}
      </Heading>
      <QualificationList qualifications={qualifications} events={events} teams={teams} />
    </Flex>
  );
}
