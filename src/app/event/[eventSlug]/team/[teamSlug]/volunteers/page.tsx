import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForVolunteers } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { getFilteredVolunteers } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import Collapsible from '@/ui/collapsible';
import DatedList from '@/ui/dated-list';
import TimeSpan from '@/ui/time-span';
import VolunteerList from '@/ui/volunteer-list';
import { addHoursToTimeString, eventDayToDate } from '@/utils/datetime';
import { getPermissionsProfile } from '@/utils/permissions';
import { recordToUserFilters } from '@/utils/user-filters';
import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'TeamPage.VolunteersTab';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const t = await getTranslations(PAGE_KEY);
    const { eventSlug, teamSlug } = params;
    const team = !eventSlug || !teamSlug ? null : await getTeamBySlug(eventSlug, teamSlug);
    return `${t('title')} | ${team?.name ?? ''}`;
  }
});

interface Props {}

export default async function TeamVolunteers({
  params,
  searchParams
}: PageProps<`/event/[eventSlug]/team/[teamSlug]/volunteers`>) {
  const { eventSlug, teamSlug } = await params;
  const t = await getTranslations(PAGE_KEY);
  const event = await getEventBySlug(eventSlug);
  const team = await getTeamBySlug(eventSlug, teamSlug);
  if (!event || !team) {
    notFound();
  }
  checkAuthorisation([
    { type: 'admin' },
    { type: 'organiser', eventId: team.eventId },
    { type: 'team-lead', eventId: team.eventId, teamId: team.id }
  ]);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const filters = recordToUserFilters(await searchParams);
  filters.onTeam = team.id;
  const volunteers = await getFilteredVolunteers(filters, permissionsProfile);
  const shifts = await getShiftsForVolunteers(
    team.eventId,
    volunteers.map((v) => v.id)
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

  return (
    <VolunteerList
      volunteers={volunteers}
      withFilters={['searchQuery']}
      itemContent={shiftPanels}
    />
  );
}
