import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Box, Button, Card, TextField, Select } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createEvent } from '@/service/event-service';
import { addUserRole, getUsers } from '@/service/user-service';

export const generateMetadata = metadata('CreateEvent');

export default async function EventsDashboard() {
  const t = await getTranslations('CreateEvent');

  const users = await getUsers();

  const onSubmit = async (data: FormData) => {
    'use server';
    const name = data.get('name')?.toString() ?? null;
    if (!name) {
      throw new Error('Event name is required');
    }
    const organiser = data.get('organiserId')?.toString() ?? null;
    if (!organiser) {
      throw new Error('Organiser is required');
    }
    const newEvent = await createEvent({
      name
    });
    await addUserRole(organiser, { type: 'organiser', eventId: newEvent.id });
    console.info('Created new event:', newEvent);
    redirect('/event');
  };

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <form action={onSubmit}>
          <Flex direction="column" gap="2">
            <TextField.Root name="name" placeholder={t('eventName')} required />
            <Select.Root required name="organiserId">
              <Select.Trigger placeholder={t('eventOrganiser')} />
              <Select.Content>
                {users.map((user) => (
                  <Select.Item key={user.id} value={user.id}>
                    {user.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Box>
              <Button type="submit">{t('createButton')}</Button>
            </Box>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
