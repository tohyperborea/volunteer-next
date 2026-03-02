import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import QualificationList from '@/ui/qualification-list';
import { Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

const PAGE_KEY = 'QualificationsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = eventSlug ? await getEventBySlug(eventSlug) : null;
    const t = await getTranslations(PAGE_KEY);
    return t('title', { eventName: event?.name ?? '' });
  }
});

const MOCK_QUALS: Qualification[] = [
  {
    id: 'qual-1',
    name: 'First Aid',
    eventId: 'event-1',
    teamId: 'first-aid-team',
    errorMessage: 'You must have a valid first aid certificate to qualify for this role.'
  },
  {
    id: 'qual-2',
    name: 'Food Handling',
    eventId: 'event-1',
    errorMessage: 'You must have a valid food handling certificate to qualify for this role.'
  },
  {
    id: 'qual-3',
    name: 'FAST Training',
    eventId: 'event-1',
    teamId: 'fast-team',
    errorMessage: 'You must have completed FAST training to qualify for this role.'
  }
];

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function QualificationsPage({ params }: Props) {
  const { eventSlug } = await params;
  return (
    <Box p="4">
      <QualificationList qualifications={MOCK_QUALS} />
    </Box>
  );
}
