import metadata from '@/i18n/metadata';
import { getTeamBySlug } from '@/service/team-service';
import { Box, Flex, Heading, Tabs } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import TeamInfo from './teamInfo';
import TeamShifts from './teamShifts';
import TeamVolunteers from './teamVolunteers';

const PAGE_KEY = 'TeamPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug, teamSlug } = params;
    const team = !eventSlug || !teamSlug ? null : await getTeamBySlug(eventSlug, teamSlug);
    return team?.name ?? '';
  }
});

interface Props {
  params: Promise<{ eventSlug: string; teamSlug: string }>;
}

export default async function TeamPage({ params }: Props) {
  const t = await getTranslations(PAGE_KEY);
  const { eventSlug, teamSlug } = await params;
  const team = eventSlug && teamSlug ? await getTeamBySlug(eventSlug, teamSlug) : null;

  if (!team) {
    notFound();
  }

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{team.name}</Heading>
      <Tabs.Root defaultValue="team">
        <Tabs.List>
          <Tabs.Trigger value="team">{t('tabs.team')}</Tabs.Trigger>
          <Tabs.Trigger value="shifts">{t('tabs.shifts')}</Tabs.Trigger>
          <Tabs.Trigger value="volunteers">{t('tabs.volunteers')}</Tabs.Trigger>
        </Tabs.List>
        <Box pt="3">
          <Tabs.Content value="team">
            <TeamInfo team={team} />
          </Tabs.Content>
          <Tabs.Content value="shifts">
            <TeamShifts />
          </Tabs.Content>
          <Tabs.Content value="volunteers">
            <TeamVolunteers />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Flex>
  );
}
