import metadata from '@/i18n/metadata';
import { notFound, redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { getEventBySlug } from '@/service/event-service';
import { addRoleToUser, getUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import TeamForm from '@/ui/team-form';
import { validateUserId } from '@/validator/user-validator';
import { validateNewTeam } from '@/validator/team-validator';
import { createTeam } from '@/service/team-service';

const PAGE_KEY = 'CreateTeamPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = eventSlug ? await getEventBySlug(eventSlug) : null;
    const t = await getTranslations(PAGE_KEY);
    return t('title', { eventName: event?.name ?? '' });
  }
});

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function CreateTeam({ params }: Props) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    notFound();
  }

  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: event.id }]);
  const t = await getTranslations(PAGE_KEY);
  const users = await getUsers();

  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: event.id }]);

    const newTeam = validateNewTeam(data);
    const teamlead = validateUserId(data, 'teamleadId');

    await inTransaction(async (client) => {
      const createdTeam = await createTeam(newTeam, client);
      await addRoleToUser(
        { type: 'team-lead', eventId: event.id, teamId: createdTeam.id },
        teamlead,
        client
      );
    });
    redirect(`/event/${eventSlug}/team`);
  };

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title', { eventName: event?.name ?? '' })}</Heading>
      <Card>
        <TeamForm eventId={event.id} onSubmit={onSubmit} backOnCancel teamleadOptions={users} />
      </Card>
    </Flex>
  );
}
