/**
 * Component for displaying a filterable list of teams for an event
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Card, Flex, Link, Text } from '@radix-ui/themes';
import TeamCard from '../team-card';
import { useTranslations } from 'next-intl';
import { getTeamInfoPath } from '@/utils/path';

interface Props {
  teams: TeamInfo[];
  eventSlug: string;
  itemActions?: Record<TeamId, React.ReactNode>;
}

export default function TeamList({ teams, eventSlug, itemActions = {} }: Props) {
  const t = useTranslations('TeamList');
  if (teams.length === 0) {
    return (
      <Card>
        <Text>{t('noTeams')}</Text>
      </Card>
    );
  }
  return (
    <Flex direction="column" gap="4" asChild m="0" p="0">
      <li>
        {teams.map((team) => (
          <Box asChild m="0" p="0" key={team.id}>
            <ul style={{ listStyle: 'none' }}>
              <TeamCard eventSlug={eventSlug} team={team} actions={itemActions[team.id]} />
            </ul>
          </Box>
        ))}
      </li>
    </Flex>
  );
}
