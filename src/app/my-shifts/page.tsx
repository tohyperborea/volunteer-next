import metadata from '@/i18n/metadata';
import { getShiftsForVolunteer, removeVolunteerFromShift } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import SearchBar from '@/ui/search-bar';
import ShiftOverviewList from '@/ui/shift-overview-list';
import { getMyShiftsPath, getVolunteerShiftsApiPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { Share2Icon } from '@radix-ui/react-icons';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'MyShiftsPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function MyShifts() {
  await checkAuthorisation();
  const t = await getTranslations(PAGE_KEY);
  const event = await getCurrentEventOrRedirect();
  const user = (await currentUser())!; // checkAuthorisation guarantees this
  const shifts = await getShiftsForVolunteer(event.id, user.id);
  const shiftVolunteers = await getVolunteersForShifts(
    shifts.map((shift) => shift.id),
    getPermissionsProfile(user)
  );
  const teams = await getTeamsForEvent(event.id);

  const onCancelShift = async (shiftId: ShiftId) => {
    'use server';
    await removeVolunteerFromShift(shiftId, user.id);
    revalidatePath(getMyShiftsPath());
  };

  return (
    <Flex direction="column" gap="6" py="4">
      <Heading align="center" as="h1" size="6">
        {t('title')}
      </Heading>
      <Flex direction="row" gap="2">
        <Button variant="soft" asChild>
          <a
            href={getVolunteerShiftsApiPath(event.slug, user.id, { format: 'csv' })}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Share2Icon />
            {t('export')}
          </a>
        </Button>
      </Flex>
      <ShiftOverviewList
        event={event}
        teams={teams}
        shifts={shifts}
        shiftVolunteers={shiftVolunteers}
        onCancelShift={onCancelShift}
      />
    </Flex>
  );
}
