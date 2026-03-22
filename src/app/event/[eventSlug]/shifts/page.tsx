import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import DatedList from '@/ui/dated-list';
import SearchBar from '@/ui/search-bar';
import ShiftCard from '@/ui/shift-card';
import { eventDayToDate } from '@/utils/datetime';
import { getEventShiftsApiPath } from '@/utils/path';
import { Share2Icon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'EventShiftsPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventShifts({ params }: PageProps<'/event/[eventSlug]/shifts'>) {
  const t = await getTranslations(PAGE_KEY);
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    notFound();
  }

  const shifts = await getShiftsForEvent(event.id);
  const teams = await getTeamsForEvent(event.id);
  const teamNames = teams.reduce<Record<TeamId, string>>(
    (acc, team) => ({ ...acc, [team.id]: team.name }),
    {}
  );

  const teamShiftsByDay = shifts.reduce<Record<number, Record<TeamId, ShiftInfo[]>>>(
    (acc, shift) => ({
      ...acc,
      [shift.eventDay]: {
        ...acc[shift.eventDay],
        [shift.teamId]: [...(acc[shift.eventDay]?.[shift.teamId] ?? []), shift]
      }
    }),
    {}
  );

  return (
    <Flex direction="column" gap="6" py="4">
      <Heading align="center" as="h1" size="6">
        {t('allShifts')}
      </Heading>
      <Flex direction="row" gap="2">
        <Button variant="soft" asChild>
          <a
            href={getEventShiftsApiPath(eventSlug, { format: 'csv' })}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Share2Icon />
            {t('export')}
          </a>
        </Button>
      </Flex>
      <SearchBar />
      <DatedList
        items={Object.entries(teamShiftsByDay)}
        getDate={([day]) => eventDayToDate(event.startDate, parseInt(day, 10))}
        renderItem={([day, teams]) => (
          <Flex key={day} direction="column" gap="4">
            {Object.entries(teams).map(([teamId, shifts]) => (
              <Card key={teamId}>
                <Heading as="h3" size="4">
                  {teamNames[teamId]}
                </Heading>
                <Flex direction="column" gap="2" mt="4">
                  {shifts.map((shift) => (
                    <ShiftCard
                      event={event}
                      shift={shift}
                      volunteerNames={[] /* TODO */}
                      key={shift.id}
                      collapsible
                    />
                  ))}
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      />
    </Flex>
  );
}
