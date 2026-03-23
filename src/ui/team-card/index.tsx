/**
 * Team card component
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { getTeamShiftsPath } from '@/utils/path';
import { Box, Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import ProgressBar from '../progress-bar';
import Collapsible from '../collapsible';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';

interface Props {
  team: TeamInfo;
  shifts: ShiftInfo[];
  eventSlug: string;
  actions?: React.ReactNode;
}
export default function TeamCard({ team, shifts, eventSlug, actions }: Props) {
  const t = useTranslations('TeamCard');
  const shiftSpots = shifts.reduce((spots, shift) => spots + shift.maxVolunteers, 0);
  const filledSpots = 0; // TODO: depends on shift signup infrastructure
  const volunteerNames: string[] = []; // TODO: depends on shift signup infrastructure
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" gap="4">
          <Link
            highContrast
            underline="none"
            href={getTeamShiftsPath(eventSlug, team.slug)}
            asChild
          >
            <NextLink href={getTeamShiftsPath(eventSlug, team.slug)}>
              <Flex direction="column">
                <Heading as="h3" size="4">
                  {team.name}
                </Heading>
                <Text>{team.description}</Text>
              </Flex>
            </NextLink>
          </Link>
          <Flex>{actions}</Flex>
        </Flex>
        <Box style={{ maxWidth: '200px' }}>
          <ProgressBar filled={filledSpots} total={shiftSpots} />
        </Box>
        <Box style={{ maxWidth: '600px' }}>
          <Collapsible header={t('volunteers')}>
            <Flex direction="column" gap="1">
              {volunteerNames.map((name) => (
                <Text key={name}>{name}</Text>
              ))}
            </Flex>
          </Collapsible>
        </Box>
      </Flex>
    </Card>
  );
}
