/**
 * Layout component for all teams tab pages.
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

import { usersToVolunteers } from '@/lib/volunteer';
import { getTeamBySlug } from '@/service/team-service';
import { getTeamLeadsForTeam } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import VolunteerCard from '@/ui/volunteer-card';
import { getTeamShiftsPath, getTeamVolunteersPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { Box, DataList, Flex, Heading, Link, TabNav, Text } from '@radix-ui/themes';
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
  const teamLeads = usersToVolunteers(await getTeamLeadsForTeam(team.id), permissionsProfile);

  const headerList = await headers();
  const path = headerList.get('x-pathname');

  const shiftsPath = getTeamShiftsPath(eventSlug, teamSlug);
  const volunteersPath = getTeamVolunteersPath(eventSlug, teamSlug);
  return (
    <Flex direction="column">
      <Heading my="4" align="center">
        {team.name}
      </Heading>
      {team.description}
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
          <TabNav.Root>
            <TabNav.Link active={path === shiftsPath} href={shiftsPath}>
              {t('tabs.shifts')}
            </TabNav.Link>
            <TabNav.Link active={path === volunteersPath} href={volunteersPath}>
              {t('tabs.volunteers')}
            </TabNav.Link>
          </TabNav.Root>
          <Box mt="6">{children}</Box>
        </>
      ) : (
        children
      )}
    </Flex>
  );
}
