import metadata from '@/i18n/metadata';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import SearchBar from '@/ui/search-bar';
import ShiftOverviewList from '@/ui/shift-overview-list';
import { getEventShiftsApiPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { Share2Icon } from '@radix-ui/react-icons';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'EventShiftsPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventShifts() {
  await checkAuthorisation();
  const t = await getTranslations(PAGE_KEY);
  const event = await getCurrentEventOrRedirect();
  if (!event) {
    notFound();
  }

  const shifts = await getShiftsForEvent(event.id);
  const shiftVolunteers = await getVolunteersForShifts(
    shifts.map((shift) => shift.id),
    getPermissionsProfile(await currentUser())
  );
  const teams = await getTeamsForEvent(event.id);

  return (
    <Flex direction="column" gap="6" py="4">
      <Heading align="center" as="h1" size="6">
        {t('allShifts')}
      </Heading>
      <Flex direction="row" gap="2">
        <Button variant="soft" asChild>
          <a
            href={getEventShiftsApiPath(event.slug, { format: 'csv' })}
            rel="noopener noreferrer"
            target="_blank"
            data-umami-event="Export event shifts"
            data-umami-event-eventSlug={event.slug}
          >
            <Share2Icon />
            {t('export')}
          </a>
        </Button>
      </Flex>
      <SearchBar />
      <ShiftOverviewList
        event={event}
        teams={teams}
        shifts={shifts}
        shiftVolunteers={shiftVolunteers}
      />
    </Flex>
  );
}
