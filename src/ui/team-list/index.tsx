/**
 * Component for displaying a filterable list of teams for an event
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Card, Flex, Text } from '@radix-ui/themes';
import TeamCard from '../team-card';
import { useTranslations } from 'next-intl';
import TeamFilters from '../team-filters';

interface Props {
  teams: TeamInfo[];
  shifts: ShiftInfo[];
  shiftVolunteers: Record<ShiftId, VolunteerInfo[]>;
  itemActions?: Record<TeamId, React.ReactNode>;
}

export default function TeamList({ teams, shifts, shiftVolunteers, itemActions = {} }: Props) {
  const t = useTranslations('TeamList');
  if (teams.length === 0) {
    return (
      <Card>
        <Text>{t('noTeams')}</Text>
      </Card>
    );
  }
  const shiftsByTeamId = shifts.reduce<Record<TeamId, ShiftInfo[]>>((acc, shift) => {
    if (!acc[shift.teamId]) {
      acc[shift.teamId] = [];
    }
    acc[shift.teamId].push(shift);
    return acc;
  }, {});
  return (
    <Flex direction="column" gap="4">
      <TeamFilters withFilters={['searchQuery']} />
      <Flex direction="column" gap="4" asChild m="0" p="0">
        <ul style={{ listStyle: 'none' }}>
          {teams.map((team) => (
            <Box asChild m="0" p="0" key={team.id}>
              <li>
                <TeamCard
                  team={team}
                  shifts={shiftsByTeamId[team.id] ?? []}
                  shiftVolunteers={shiftVolunteers}
                  actions={itemActions[team.id]}
                  showSignup
                />
              </li>
            </Box>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
}
