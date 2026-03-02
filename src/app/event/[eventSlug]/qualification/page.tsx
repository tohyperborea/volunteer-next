import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { getTeamsForEvent } from '@/service/team-service';
import QualificationList from '@/ui/qualification-list';
import { getQualificationsPath } from '@/utils/path';
import { Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

const PAGE_KEY = 'QualificationsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = eventSlug ? await getEventBySlug(eventSlug) : null;
    const t = await getTranslations(PAGE_KEY);
    return t('title', { eventName: event?.name ?? '' });
  }
});

const MOCK_QUALS: QualificationInfo[] = [
  {
    id: 'qual-1',
    name: 'First Aid',
    eventId: 'test-event',
    teamId: '847ccf19-0072-486b-8c3f-81a36d5c8d94',
    errorMessage: 'You must have a valid first aid certificate to qualify for this role.'
  },
  {
    id: 'qual-2',
    name: 'Food Handling',
    eventId: 'test-event',
    errorMessage: 'You must have a valid food handling certificate to qualify for this role.'
  },
  {
    id: 'qual-3',
    name: 'FAST Training',
    eventId: 'test-event',
    teamId: 'dffa1218-79ab-45f1-a0d9-0d84444cddcf',
    errorMessage: 'You must have completed FAST training to qualify for this role.'
  }
];

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function QualificationsPage({ params }: Props) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    return notFound();
  }
  const teams = await getTeamsForEvent(event.id);

  // TODO: Authorisation for editors

  const onSave = async (data: FormData) => {
    'use server';
    console.log('Saving qualification with data:', Object.fromEntries(data.entries()));
    // TODO: authorisation
    // TODO: validation
    // TODO: persistence
    redirect(getQualificationsPath(event.slug));
  };

  return (
    <Box p="4">
      <QualificationList qualifications={MOCK_QUALS} event={event} teams={teams} onSave={onSave} />
    </Box>
  );
}
