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
  shifts: ShiftInfo[];
  shiftVolunteers?: Record<ShiftId, VolunteerInfo[]>;
  eventSlug: string;
  actions?: React.ReactNode;
  showSignup?: boolean;
}
export default function TeamCard({
  team,
  shifts,
  shiftVolunteers,
  eventSlug,
  actions,
  showSignup
}: Props) {
  const t = useTranslations('TeamCard');
  const shiftSpots = shifts.reduce((spots, shift) => spots + shift.maxVolunteers, 0);
  const filledSpots = shifts.reduce((spots, shift) => {
    const volunteers = shiftVolunteers?.[shift.id] ?? [];
    return spots + volunteers.length;
  }, 0);
  const volunteerNames = deduplicateBy(
    shifts.flatMap((shift) => {
      const volunteers = shiftVolunteers?.[shift.id] ?? [];
      return volunteers.map((volunteer) => volunteer.displayName);
    }),
    (name) => name
  );
  const isFull = filledSpots >= shiftSpots;
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" gap="4">
          {/* Content */}
          <Flex
            flexGrow="1"
            align={{ initial: 'stretch', sm: 'center' }}
            direction={{ initial: 'column', sm: 'row' }}
            gap="3"
          >
            <Link asChild highContrast underline="hover">
              <NextLink href={getTeamShiftsPath(eventSlug, team.slug)}>
                <Heading as="h3" size="4">
                  {team.name}
                </Heading>
              </NextLink>
            </Link>
            <Flex justify={{ initial: 'between', sm: 'end' }} align="center" flexGrow="1" gap="4">
              <ProgressBar
                colour={getStatusColour(shifts, shiftVolunteers)}
                filled={shiftSpots - filledSpots}
                total={shiftSpots}
              />
              {showSignup && (
                <Button asChild disabled={isFull} title={isFull ? t('full') : undefined}>
                  {isFull ? (
                    <Text>{t('signup')}</Text>
                  ) : (
                    <NextLink href={getTeamShiftsPath(eventSlug, team.slug)}>
                      {t('signup')}
                    </NextLink>
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

const getStatusColour = (
  shifts: ShiftInfo[],
  shiftVolunteers: Record<ShiftId, VolunteerInfo[]> = {}
) => {
  let anyBelowMin = false;
  let allFull = false;
  for (const shift of shifts) {
    const volunteers = shiftVolunteers?.[shift.id] ?? [];
    if (volunteers.length === 0) {
      return 'red';
    }
    if (volunteers.length < shift.minVolunteers) {
      anyBelowMin = true;
    }
    if (volunteers.length < shift.maxVolunteers) {
      allFull = false;
    }
  }
  if (anyBelowMin) {
    return 'orange';
  }
  if (allFull) {
    return 'green';
  }
  return 'accent';
};
