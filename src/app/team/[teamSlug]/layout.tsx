/**
 * Layout component for all teams tab pages.
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

import { usersToVolunteers } from '@/lib/volunteer';
import { getTeamBySlug } from '@/service/team-service';
import { getTeamLeadsForTeam } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import VolunteerCard from '@/ui/volunteer-card';
import { getTeamShiftsPath, getTeamVolunteersPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { Box, DataList, Flex, Heading, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import TeamTabs from '@/ui/team-tabs';

const PAGE_KEY = 'TeamPage';

interface Props {
  params: Promise<{ teamSlug: string }>;
  children: React.ReactNode;
}

export default async function TeamLayout({ params, children }: Props) {
  const { teamSlug } = await params;
  const event = await getCurrentEventOrRedirect();
  const team = teamSlug ? await getTeamBySlug(event.slug, teamSlug) : null;

  if (!team) {
    notFound();
  }
  const canEdit = await checkAuthorisation(
    [
      { type: 'admin' },
      { type: 'organiser', eventId: team.eventId },
      { type: 'team-lead', eventId: team.eventId, teamId: team.id }
    ],
    true
  );

  const t = await getTranslations(PAGE_KEY);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const teamLeads = usersToVolunteers(
    await getTeamLeadsForTeam(team.id, event.id),
    permissionsProfile
  );

  const shiftsPath = getTeamShiftsPath(teamSlug);
  const volunteersPath = getTeamVolunteersPath(teamSlug);
  return (
    <Flex direction="column">
      <Heading my="4" align="center">
        {team.name}
      </Heading>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
        {team.description}
      </pre>
      <DataList.Root my="4">
        <DataList.Item>
          <DataList.Label>{t('contact')}</DataList.Label>
          <DataList.Value>
            <Link href={`mailto:${team.contactAddress}`}>{team.contactAddress}</Link>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{t('teamLeads')}</DataList.Label>
          <DataList.Value>
            <Flex direction="column" gap="1" mt="1" flexGrow="1">
              {teamLeads.map((lead) => (
                <VolunteerCard key={lead.id} volunteer={lead} />
              ))}
            </Flex>
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
      {canEdit ? (
        <>
          <TeamTabs shiftsPath={shiftsPath} volunteersPath={volunteersPath} />
          <Box mt="6">{children}</Box>
        </>
      ) : (
        children
      )}
    </Flex>
  );
}
