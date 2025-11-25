import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Box, Button, Card, TextField, Select } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createUser, addUserRole } from '@/service/user-service';
import { getEvents } from '@/service/event-service';
import { getTeams } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';

export const generateMetadata = metadata('CreateUser');

export default async function CreateUser() {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const name = data.get('name')?.toString() ?? null;
    if (!name) {
      throw new Error('User name is required');
    }
    const email = data.get('email')?.toString() ?? null;
    if (!email) {
      throw new Error('User email is required');
    }
    const role = data.get('role')?.toString() ?? null;
    if (!role) {
      throw new Error('User role is required');
    }

    await inTransaction(async (client) => {
      const newUser = await createUser({ name, email }, client);

      if (role === 'admin') {
        await addUserRole(newUser.id, { type: 'admin' }, client);
      } else if (role === 'organiser') {
        const eventId = data.get('eventId')?.toString() ?? null;
        if (!eventId) {
          throw new Error('Event ID is required for organiser role');
        }
        await addUserRole(newUser.id, { type: 'organiser', eventId }, client);
      } else if (role === 'team-lead') {
        const eventId = data.get('eventId')?.toString() ?? null;
        const teamId = data.get('teamId')?.toString() ?? null;
        if (!eventId) {
          throw new Error('Event ID is required for team-lead role');
        }
        if (!teamId) {
          throw new Error('Team ID is required for team-lead role');
        }
        await addUserRole(newUser.id, { type: 'team-lead', eventId, teamId }, client);
      }
    });
    redirect('/users');
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations('CreateUser');
  const events = await getEvents();
  const teams = await getTeams();
  const organiserDisabled = events.length === 0;
  const teamLeadDisabled = events.length === 0 || teams.length === 0;

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <form action={onSubmit}>
          <Flex direction="column" gap="2">
            <TextField.Root name="name" placeholder={t('userName')} required />
            <TextField.Root name="email" type="email" placeholder={t('userEmail')} required />
            <Select.Root required name="role">
              <Select.Trigger placeholder={t('role')} />
              <Select.Content>
                <Select.Item value="admin">{t('admin')}</Select.Item>
                <Select.Item value="organiser" disabled={organiserDisabled}>
                  {organiserDisabled ? t('organiserNoEvents') : t('organiser')}
                </Select.Item>
                <Select.Item value="team-lead" disabled={teamLeadDisabled}>
                  {teamLeadDisabled ? t('teamLeadNoEvents') : t('teamLead')}
                </Select.Item>
              </Select.Content>
            </Select.Root>
            {events.length > 0 && (
              <Select.Root name="eventId">
                <Select.Trigger placeholder={t('event') || 'Select Event'} />
                <Select.Content>
                  {events.map((event) => (
                    <Select.Item key={event.id} value={event.id}>
                      {event.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
            {teams.length > 0 && (
              <Select.Root name="teamId">
                <Select.Trigger placeholder={t('team') || 'Select Team'} />
                <Select.Content>
                  {teams.map((team) => (
                    <Select.Item key={team.id} value={team.id}>
                      {team.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
            <Box>
              <Button type="submit">{t('createButton')}</Button>
            </Box>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
