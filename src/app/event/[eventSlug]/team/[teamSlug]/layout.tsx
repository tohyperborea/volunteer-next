/**
 * Layout component for all teams tab pages.
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

import { getTeamBySlug } from '@/service/team-service';
import { getTeamInfoPath, getTeamShiftsPath, getTeamVolunteersPath } from '@/utils/path';
import { Box, Flex, Heading, TabNav } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'TeamPage';

interface Props {
  params: Promise<{ eventSlug: string; teamSlug: string }>;
  children: React.ReactNode;
}

export default async function TeamLayout({ params, children }: Props) {
  const { eventSlug, teamSlug } = await params;
  const team = eventSlug && teamSlug ? await getTeamBySlug(eventSlug, teamSlug) : null;

  if (!team) {
    notFound();
  }
  const t = await getTranslations(PAGE_KEY);

  const headerList = await headers();
  const path = headerList.get('x-current-path');

  const infoPath = getTeamInfoPath(eventSlug, teamSlug);
  const shiftsPath = getTeamShiftsPath(eventSlug, teamSlug);
  const volunteersPath = getTeamVolunteersPath(eventSlug, teamSlug);
  return (
    <Flex direction="column" p="4">
      <Heading my="4">{team.name}</Heading>
      <TabNav.Root>
        <TabNav.Link active={path === infoPath} href={infoPath}>
          {t('tabs.team')}
        </TabNav.Link>
        <TabNav.Link active={path === shiftsPath} href={shiftsPath}>
          {t('tabs.shifts')}
        </TabNav.Link>
        <TabNav.Link active={path === volunteersPath} href={volunteersPath}>
          {t('tabs.volunteers')}
        </TabNav.Link>
      </TabNav.Root>
      <Box pt="6">{children}</Box>
    </Flex>
  );
}
