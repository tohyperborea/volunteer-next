import metadata from '@/i18n/metadata';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { updateEvent, getEventsById } from '@/service/event-service';
import {
  addRoleToUser,
  getUsers,
  getUsersWithRole,
  removeRoleFromUsers
} from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import { inTransaction } from '@/db';
import EventForm from '@/ui/event-form';
import { validateExistingEvent } from '@/validator/event-validator';
import { validateUserId } from '@/validator/user-validator';
import { usersToVolunteers, userToVolunteer } from '@/lib/volunteer';
import { getPermissionsProfile } from '@/utils/permissions';
import { getEventsPath } from '@/utils/path';
import { hasEventStarted } from '@/utils/date';

const PAGE_KEY = 'UpdateEventPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function UpdateEvent({ params }: PageProps<`/update-event/[id]`>) {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const newEvent = validateExistingEvent(data);
    const organiser = validateUserId(data, 'organiserId');

    const event = (await getEventsById([newEvent.id]))[0];
    if (!event) {
      notFound();
    }
    if (hasEventStarted(event)) {
      unauthorized();
    }

    const roleToAdd: UserRole = { type: 'organiser', eventId: newEvent.id };
    const existingOrganisers = await getUsersWithRole(roleToAdd);
    // Only currently supporting a single organiser, so remove all who aren't the new one
    // If we are removing all existing organisers, it means we need to add the new one
    const toRemove = existingOrganisers
      .map((user) => user.id)
      .filter((userId) => userId !== organiser);
    const shouldAdd = toRemove.length === existingOrganisers.length;

    await inTransaction(async (client) => {
      await updateEvent(newEvent, client);
      if (toRemove.length > 0) {
        await removeRoleFromUsers(roleToAdd, toRemove, client);
      }
      if (shouldAdd) {
        await addRoleToUser(roleToAdd, organiser, client);
      }
    });
    redirect(getEventsPath());
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations(PAGE_KEY);
  const { id } = await params;
  const event = id ? (await getEventsById([id]))[0] : null;
  if (!event) {
    notFound();
  }
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const volunteers = usersToVolunteers(await getUsers(), permissionsProfile);
  const organiser = userToVolunteer(
    (await getUsersWithRole({ type: 'organiser', eventId: event.id }))[0],
    permissionsProfile
  );

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <EventForm
          onSubmit={onSubmit}
          backOnCancel
          organiserOptions={volunteers}
          editingEvent={event}
          editingOrganiser={organiser}
        />
      </Card>
    </Flex>
  );
}
