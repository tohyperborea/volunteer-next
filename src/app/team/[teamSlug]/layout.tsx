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
import { getTeamShiftsPath, getTeamVolunteersPath, getUpdateTeamPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { Box, DataList, Flex, Grid, Heading, IconButton, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import TeamTabs from '@/ui/team-tabs';
import NextLink from 'next/link';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { headers } from 'next/headers';

const PAGE_KEY = 'TeamPage';

interface Props {
  params: Promise<{ teamSlug: string }>;
  children: React.ReactNode;
}

export default async function TeamLayout({ params, children }: Props) {
  const { teamSlug } = await params;
  const event = await getCurrentEventOrRedirect();
  const team = teamSlug ? await getTeamBySlug(event.slug, teamSlug) : null;
  const currentPath = (await headers()).get('x-pathname') ?? undefined;

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
      <Flex asChild justify="center" align="center" position="relative">
        <Heading my="4">
          {team.name}
          {canEdit && (
            <IconButton
              variant="ghost"
              aria-label={t('edit', { teamName: team.name })}
              asChild
              style={{ position: 'absolute', right: 0 }}
            >
              <NextLink href={getUpdateTeamPath(team.id, currentPath)}>
                <Pencil2Icon width={20} height={20} />
              </NextLink>
            </IconButton>
          )}
        </Heading>
      </Flex>
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
            <Grid columns={{ initial: '1', md: '2' }} gap="4" width="100%">
              {teamLeads.map((lead) => (
                <VolunteerCard key={lead.id} volunteer={lead} />
              ))}
            </Grid>
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
