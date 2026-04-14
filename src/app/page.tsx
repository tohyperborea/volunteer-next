import metadata from '@/i18n/metadata';
import { Box, Button, Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NextLink from 'next/link';
import {
  checkAuthorisation,
  currentUser,
  getCurrentEvent,
  getCurrentEventOrRedirect,
  getMatchingRoles
} from '@/session';
import { getMyShiftsPath, getTeamsPath } from '@/utils/path';
import {
  getShiftsForTeam,
  getShiftsForTeams,
  getShiftsForVolunteer
} from '@/service/shift-service';
import ShiftOverviewList from '@/ui/shift-overview-list';
import { getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { getPermissionsProfile } from '@/utils/permissions';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import TeamCard from '@/ui/team-card';

const PAGE_KEY = 'DashboardPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async () => {
    const event = await getCurrentEvent();
    return event?.name ?? '';
  }
});

export default async function DashboardPage() {
  const t = await getTranslations(PAGE_KEY);
  const event = await getCurrentEventOrRedirect();
  await checkAuthorisation();

  if (!event) {
    notFound();
  }
  const user = (await currentUser())!; // checkAuthorisation ensures that this is not null
  const permissionsProfile = getPermissionsProfile(user);
  const shifts = await getShiftsForVolunteer(event.id, user.id);
  const totalHours = shifts.reduce((sum, shift) => sum + shift.durationHours, 0);
  const upcomingShifts = shifts.slice(0, 2);
  const teams = await getTeamsForEvent(event.id);
  const upcomingShiftVolunteers = await getVolunteersForShifts(
    upcomingShifts.map((s) => s.id),
    permissionsProfile,
    event.id
  );
  const myTeamIds = new Set(
    (await getMatchingRoles({ type: 'team-lead', eventId: event.id })).map(
      (role) => (role as TeamLeadRole).teamId
    )
  );
  const myTeams = teams.filter((team) => myTeamIds.has(team.id));
  const myTeamShifts = await getShiftsForTeams(Array.from(myTeamIds));
  const myTeamShiftIds = Object.values(myTeamShifts).flatMap((shifts) =>
    shifts.map((shift) => shift.id)
  );
  const myTeamVolunteers = await getVolunteersForShifts(
    myTeamShiftIds,
    permissionsProfile,
    event.id
  );

  return (
    <Flex direction="column" gap="5">
      <Heading as="h1" mt="4" style={{ width: 'min-content', textTransform: 'uppercase' }}>
        {t('yourDashboard')}
      </Heading>

      {/* Shift/Hours cards */}
      <Flex gap={{ initial: '4', md: '6' }} direction={{ initial: 'column', md: 'row' }} asChild>
        <Link asChild underline="none">
          <NextLink href={getMyShiftsPath()}>
            <DashCard topLine={t('your')} bottomLine={t('shifts')} />
            <DashCard topLine={t('totalHours')} bottomLine={String(totalHours).padStart(2, '0')} />
          </NextLink>
        </Link>
      </Flex>

      {/* Sign Up CTA */}
      <Flex asChild justify="start">
        <Link asChild>
          <Button variant="solid" highContrast size="4" asChild>
            <Box asChild py="6">
              <NextLink href={getTeamsPath()}>
                <ArrowRightIcon width={20} height={20} />
                {t('signUpHere')}
              </NextLink>
            </Box>
          </Button>
        </Link>
      </Flex>

      {/* My Teams list */}
      {myTeams.length > 0 && (
        <Flex direction="column" gap="2">
          <Heading as="h2">{t('yourTeams')}:</Heading>
          <Flex direction="column" gap="3">
            {myTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                shifts={myTeamShifts[team.id]}
                shiftVolunteers={myTeamVolunteers}
              />
            ))}
          </Flex>
        </Flex>
      )}

      {/* Upcoming Shifts list */}
      {shifts.length > 0 && (
        <Flex direction="column" gap="2">
          <Heading as="h2">{t('upcomingShifts')}:</Heading>
          <ShiftOverviewList
            shifts={upcomingShifts}
            event={event}
            teams={teams}
            shiftVolunteers={upcomingShiftVolunteers}
          />
        </Flex>
      )}

      {/* Info content */}
      <Box asChild p="5">
        <Card>
          <Flex gap="6" direction={{ initial: 'column-reverse', md: 'row' }}>
            <Flex direction="column" gap="3" flexBasis="50%" py="3">
              <Card>
                <Flex direction="column" gap="1">
                  <Text weight="medium">{`1. ${t('exploreTeams')}`}</Text>
                  <Text>{t('exploreTeamsDescription')}</Text>
                </Flex>
              </Card>
              <Card>
                <Flex direction="column" gap="1">
                  <Text weight="medium">{`2. ${t('findShift')}`}</Text>
                  <Text>{t('findShiftDescription')}</Text>
                </Flex>
              </Card>
              <Card>
                <Flex direction="column" gap="1">
                  <Text weight="medium">{`3. ${t('signUp')}`}</Text>
                  <Text>{t('signUpDescription')}</Text>
                </Flex>
              </Card>
              <Card>
                <Flex direction="column" gap="1">
                  <Text weight="medium">{`4. ${t('showUp')}`}</Text>
                  <Text>{t('showUpDescription')}</Text>
                </Flex>
              </Card>
            </Flex>
            <Flex direction="column" gap="6" flexBasis="50%">
              <Heading as="h3" size="6" weight="bold" align="center">
                {t('gettingStarted')}
              </Heading>
              <Text>{t('gettingStartedDescription')}</Text>
              <Heading as="h3" size="6" weight="bold" align="center">
                {t('tips')}
              </Heading>
              <Text>{t('tipsDescription')}</Text>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}

const DashCard = ({ topLine, bottomLine }: { topLine: string; bottomLine: string }) => {
  return (
    <Card
      style={
        {
          flexBasis: '50%',
          '--card-background-color': 'var(--accent-9)',
          color: 'var(--accent-contrast)'
        } as React.CSSProperties
      }
    >
      <Flex direction="column" gap="1">
        <Text size="2">{topLine}</Text>
        <Text size="3" weight="bold">
          {bottomLine}
        </Text>
      </Flex>
    </Card>
  );
};
