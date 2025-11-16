import metadata from '@/i18n/metadata';
import { notFound, redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { updateEvent, getEventById } from '@/service/event-service';
import {
  addRoleToUser,
  getUsers,
  getUsersWithRole,
  removeRoleFromUsers
} from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import EventForm from '@/ui/event-form';
import { validateExistingEvent } from '@/validator/event-validator';
import { validateUserId } from '@/validator/user-validator';

export const generateMetadata = metadata('UpdateEvent');

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UpdateEvent({ params }: Props) {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const newEvent = validateExistingEvent(data);
    const organiser = validateUserId(data, 'organiserId');

    const roleToAdd: UserRole = { type: 'organiser', eventId: id };
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
    redirect('/event');
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations('UpdateEvent');
  const { id } = await params;
  try {
    const event = id ? await getEventById(id) : null;
    if (!event) {
      notFound();
    }

    const users = await getUsers();
    const organiser = (await getUsersWithRole({ type: 'organiser', eventId: event.id }))[0];

    return (
      <Flex direction="column" gap="4" p="4">
        <Heading my="4">{t('title')}</Heading>
        <Card>
          <EventForm
            onSubmit={onSubmit}
            backOnCancel
            organiserOptions={users}
            editingEvent={event}
            editingOrganiser={organiser}
          />
        </Card>
      </Flex>
    );
  } catch (error) {
    console.error(error);
    throw new Error('Invalid input');
  }
}
