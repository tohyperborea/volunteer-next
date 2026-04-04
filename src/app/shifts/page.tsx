import metadata from '@/i18n/metadata';
import { getNotifyVolunteersAction } from '@/lib/email';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import SearchBar from '@/ui/search-bar';
import SendEmailButton from '@/ui/send-email-button';
import ShiftOverviewList from '@/ui/shift-overview-list';
import { deduplicateBy } from '@/utils/list';
import { getEventShiftsApiPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { Share2Icon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'EventShiftsPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventShifts() {
  const event = await getCurrentEventOrRedirect();
  if (!event) {
    notFound();
  }

  const notifyRoles: UserRoleMatchCriteria[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: event.id }
  ];
  const canNotify = await checkAuthorisation(notifyRoles, true);

  const t = await getTranslations(PAGE_KEY);
  const shifts = await getShiftsForEvent(event.id);
  const shiftMap = Object.fromEntries(shifts.map((shift) => [shift.id, shift]));
  const shiftVolunteers = await getVolunteersForShifts(
    Object.keys(shiftMap),
    getPermissionsProfile(await currentUser()),
    event.id
  );
  const shiftsByVolunteerId = Object.entries(shiftVolunteers).reduce<Record<UserId, ShiftInfo[]>>(
    (acc, [shiftId, volunteers]) => {
      for (const volunteer of volunteers) {
        if (!acc[volunteer.id]) {
          acc[volunteer.id] = [];
        }
        acc[volunteer.id].push(shiftMap[shiftId]);
      }
      return acc;
    },
    {}
  );
  const teams = await getTeamsForEvent(event.id);
  const emailableVolunteers = deduplicateBy(
    Object.values(shiftVolunteers).flat(),
    ({ id }) => id
  ).filter((v) => v.email);

  const doNotify = getNotifyVolunteersAction({
    volunteers: emailableVolunteers,
    shiftsByVolunteerId,
    event,
    teams,
    acceptedRoles: notifyRoles
  });

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
            data-umami-event-eventslug={event.slug}
          >
            <Share2Icon />
            {t('export')}
          </a>
        </Button>
        {canNotify && (
          <SendEmailButton
            variant="soft"
            successMessage={t('emailSuccessMessage')}
            successTitle={t('emailSuccessTitle')}
            failureMessage={t('emailFailureMessage')}
            failureTitle={t('emailFailureTitle')}
            customisable
            numEmails={emailableVolunteers.length}
            emailContext={event.name}
            sendEmail={doNotify}
          >
            <EnvelopeClosedIcon />
            {t('notifyVolunteers')}
          </SendEmailButton>
        )}
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
