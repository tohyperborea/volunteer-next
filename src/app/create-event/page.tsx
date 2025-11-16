import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createEvent } from '@/service/event-service';
import { addRoleToUser, getUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import EventForm from '@/ui/event-form';
import { validateNewEvent } from '@/validator/event-validator';
import { validateUserId } from '@/validator/user-validator';

export const generateMetadata = metadata('CreateEvent');

export default async function CreateEvent() {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const newEvent = validateNewEvent(data);
    const organiser = validateUserId(data, 'organiserId');

    await inTransaction(async (client) => {
      const createdEvent = await createEvent(newEvent, client);
      await addRoleToUser({ type: 'organiser', eventId: createdEvent.id }, organiser, client);
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
        <EventForm onSubmit={onSubmit} backOnCancel organiserOptions={users} />
      </Card>
    </Flex>
  );
}
