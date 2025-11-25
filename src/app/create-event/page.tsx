import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createEvent } from '@/service/event-service';
import { addRoleToUser, getUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import EventForm from '@/ui/event-form';

export const generateMetadata = metadata('CreateEvent');

export default async function CreateEvent() {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

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
    await inTransaction(async (client) => {
      const newEvent = await createEvent(
        {
          name,
          startDate,
          endDate
        },
        client
      );
      await addRoleToUser({ type: 'organiser', eventId: newEvent.id }, organiser, client);
    });
    redirect('/event');
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations('CreateEvent');
  const users = await getUsers();

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <EventForm onSubmit={onSubmit} organiserOptions={users} />
      </Card>
    </Flex>
  );
}
