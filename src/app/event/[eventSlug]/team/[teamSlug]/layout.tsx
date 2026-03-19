/**
 * Layout component for all teams tab pages.
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

import { getTeamBySlug } from '@/service/team-service';
import TeamTabs from '@/ui/team-tabs';
import { getTeamInfoPath, getTeamShiftsPath, getTeamVolunteersPath } from '@/utils/path';
import { Box, Flex, Heading } from '@radix-ui/themes';
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

  const infoPath = getTeamInfoPath(eventSlug, teamSlug);
  const shiftsPath = getTeamShiftsPath(eventSlug, teamSlug);
  const volunteersPath = getTeamVolunteersPath(eventSlug, teamSlug);
  return (
    <Flex direction="column">
      <Heading my="4">{team.name}</Heading>
      <TeamTabs infoPath={infoPath} shiftsPath={shiftsPath} volunteersPath={volunteersPath} />
      <Box pt="6">{children}</Box>
    </Flex>
  );
}
