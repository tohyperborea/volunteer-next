import metadata from '@/i18n/metadata';
import { getShiftsForVolunteers } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { getFilteredVolunteers } from '@/service/user-service';
import {
  checkAuthorisation,
  currentUser,
  getCurrentEvent,
  getCurrentEventOrRedirect
} from '@/session';
import Collapsible from '@/ui/collapsible';
import DatedList from '@/ui/dated-list';
import TimeSpan from '@/ui/time-span';
import VolunteerList from '@/ui/volunteer-list';
import { addHoursToTimeString, eventDayToDate } from '@/utils/datetime';
import { getPermissionsProfile } from '@/utils/permissions';
import { recordToUserFilters } from '@/utils/user-filters';
import { Button, Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NextLink from 'next/link';
import { getTeamVolunteersApiPath } from '@/utils/path';
import { EnvelopeClosedIcon, Share2Icon } from '@radix-ui/react-icons';
import SendEmailButton from '@/ui/send-email-button';
import { getNotifyVolunteersAction } from '@/lib/email';

const PAGE_KEY = 'TeamPage.VolunteersTab';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const t = await getTranslations(PAGE_KEY);
    const { teamSlug } = params;
    const event = await getCurrentEvent();
    const team = !event || !teamSlug ? null : await getTeamBySlug(event.slug, teamSlug);
    return `${t('title')} | ${team?.name ?? ''}`;
  }
});

export default async function TeamVolunteers({
  params,
  searchParams
}: PageProps<`/team/[teamSlug]/volunteers`>) {
  const { teamSlug } = await params;
  const t = await getTranslations(PAGE_KEY);
  const event = await getCurrentEventOrRedirect();
  const team = await getTeamBySlug(event.slug, teamSlug);
  if (!event || !team) {
    notFound();
  }
  await checkAuthorisation([
    { type: 'admin' },
    { type: 'organiser', eventId: team.eventId },
    { type: 'team-lead', eventId: team.eventId, teamId: team.id }
  ]);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const filters = recordToUserFilters(await searchParams);
  filters.onTeam = team.id;
  const volunteers = await getFilteredVolunteers(filters, permissionsProfile);
  const shifts = await getShiftsForVolunteers(
    volunteers.map((v) => v.id),
    { team }
  );

  const shiftPanels = volunteers.reduce<Record<UserId, React.ReactNode>>((acc, volunteer) => {
    if (shifts[volunteer.id]?.length) {
      acc[volunteer.id] = (
        <Collapsible header={t('shifts')}>
          <DatedList
            items={shifts[volunteer.id]}
            getDate={(s) => eventDayToDate(event.startDate, s.eventDay)}
            renderItem={(shift) => (
              <Flex direction="column" key={`${volunteer.id}:${shift.id}`} asChild>
                <Text size="3">
                  {shift.title}
                  <TimeSpan
                    start={shift.startTime}
                    end={addHoursToTimeString(shift.startTime, shift.durationHours)}
                  />
                </Text>
              </Flex>
            )}
          />
        </Collapsible>
      );
    }
    return acc;
  }, {});

  const doNotify = getNotifyVolunteersAction({
    volunteers,
    shiftsByVolunteerId: shifts,
    event,
    teams: [team]
  });

  return (
    <Flex direction="column" gap="6">
      <Flex gap="2">
        <Button asChild variant="soft">
          <NextLink
            href={getTeamVolunteersApiPath(event.slug, teamSlug, { format: 'csv' })}
            target="_blank"
            rel="noopener"
          >
            <Share2Icon />
            {t('export')}
          </NextLink>
        </Button>
        <SendEmailButton
          variant="soft"
          successMessage={t('emailSuccessMessage')}
          successTitle={t('emailSuccessTitle')}
          failureMessage={t('emailFailureMessage')}
          failureTitle={t('emailFailureTitle')}
          customisable
          numEmails={volunteers.length}
          emailContext={team.name}
          sendEmail={doNotify}
        >
          <EnvelopeClosedIcon />
          {t('notifyVolunteers')}
        </SendEmailButton>
      </Flex>
      <VolunteerList
        volunteers={volunteers}
        withFilters={['searchQuery']}
        itemContent={shiftPanels}
      />
    </Flex>
  );
}
