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
import { UserRole } from '@/types';

export const generateMetadata = metadata('UpdateEvent');

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UpdateEvent({ params }: Props) {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const id = data.get('id')?.toString() ?? null;
    if (!id) {
      throw new Error('Event ID is required');
    }
    const name = data.get('name')?.toString() ?? null;
    if (!name) {
      throw new Error('Event name is required');
    }
    const startDateString = data.get('startDate')?.toString() ?? null;
    if (!startDateString) {
      throw new Error('Start date is required');
    }
    const endDateString = data.get('endDate')?.toString() ?? null;
    if (!endDateString) {
      throw new Error('End date is required');
    }
    const organiser = data.get('organiserId')?.toString() ?? null;
    if (!organiser) {
      throw new Error('Organiser is required');
    }
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    if (endDate < startDate) {
      throw new Error('End date cannot be before start date');
    }

    const roleToAdd: UserRole = { type: 'organiser', eventId: id };
    const existingOrganisers = await getUsersWithRole(roleToAdd);
    // Only currently supporting a single organiser, so remove all who aren't the new one
    // If we are removing all existing organisers, it means we need to add the new one
    const toRemove = existingOrganisers
      .map((user) => user.id)
      .filter((userId) => userId !== organiser);
    const shouldAdd = toRemove.length === existingOrganisers.length;

    await inTransaction(async (client) => {
      await updateEvent(
        {
          id,
          name,
          startDate,
          endDate
        },
        client
      );
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
