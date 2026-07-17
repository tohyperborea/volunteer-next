/**
 * Team card component
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { getTeamShiftsPath } from '@/utils/path';
import { Box, Button, Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import ProgressBar from '../progress-bar';
import Collapsible from '../collapsible';
import { useTranslations } from 'next-intl';
import { deduplicateBy } from '@/utils/list';
import NextLink from 'next/link';

interface Props {
  team: TeamInfo;
  shifts?: ShiftInfo[];
  shiftVolunteers?: Record<ShiftId, VolunteerInfo[]>;
  actions?: React.ReactNode;
  showSignup?: boolean;
}
export default function TeamCard({ team, shifts, shiftVolunteers, actions, showSignup }: Props) {
  const t = useTranslations('TeamCard');
  const shiftSpots = shifts?.reduce((spots, shift) => spots + shift.maxVolunteers, 0) ?? 0;
  const filledSpots =
    shifts?.reduce((spots, shift) => {
      const volunteers = shiftVolunteers?.[shift.id] ?? [];
      return spots + volunteers.length;
    }, 0) ?? 0;
  const volunteerNames = shifts
    ? deduplicateBy(
        shifts.flatMap((shift) => {
          const volunteers = shiftVolunteers?.[shift.id] ?? [];
          return volunteers.map((volunteer) => volunteer.displayName);
        }),
        (name) => name
      )
    : [];
  const isFull = filledSpots >= shiftSpots;
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" gap="4">
          {/* Content */}
          <Flex
            flexGrow="1"
            align={{ initial: 'stretch', sm: 'start' }}
            direction={{ initial: 'column', sm: 'row' }}
            gap="3"
          >
            <Link asChild highContrast underline="hover">
              <NextLink href={getTeamShiftsPath(team.slug)}>
                <Heading as="h3" size="4">
                  {team.name}
                </Heading>
              </NextLink>
            </Link>
            <Flex justify={{ initial: 'between', sm: 'end' }} align="start" flexGrow="1" gap="4">
              {shifts && (
                <Box width="100%" maxWidth={{ sm: '200px' }}>
                  <ProgressBar
                    filled={filledSpots}
                    total={shiftSpots}
                    needed={getNumNeeded(shifts, shiftVolunteers)}
                  />
                </Box>
              )}
              {showSignup && (
                <Button asChild={!isFull} disabled={isFull} title={isFull ? t('full') : undefined}>
                  {isFull ? (
                    <Text>{t('signup')}</Text>
                  ) : (
                    <NextLink href={getTeamShiftsPath(team.slug)}>{t('signup')}</NextLink>
                  )}
                </Button>
              )}
            </Flex>
          </Flex>
          {/* Actions */}
          <Flex top="3" right="3" position={{ initial: 'absolute', sm: 'static' }}>
            {actions}
          </Flex>
        </Flex>
        {/* Collapsible volunteers */}
        {volunteerNames.length > 0 && (
          <Collapsible header={t('volunteers')}>
            <Flex direction="column" gap="1">
              {volunteerNames.map((name) => (
                <Text key={name}>{name}</Text>
              ))}
            </Flex>
          </Collapsible>
        )}
      </Flex>
    </Card>
  );
}

const getNumNeeded = (
  shifts: ShiftInfo[],
  shiftVolunteers: Record<ShiftId, VolunteerInfo[]> = {}
) =>
  shifts.reduce(
    (total, curr) =>
      total + Math.max(0, curr.minVolunteers - (shiftVolunteers[curr.id]?.length ?? 0)),
    0
  );
