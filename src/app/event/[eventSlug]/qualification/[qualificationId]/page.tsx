import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import QualificationDetails from '@/ui/qualification-details';
import VolunteerList from '@/ui/volunteer-list';
import { getQualificationDetailsPath, getQualificationsPath } from '@/utils/path';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

const PAGE_KEY = 'QualificationDetailsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = eventSlug ? await getEventBySlug(eventSlug) : null;
    const t = await getTranslations(PAGE_KEY);
    return t('title', { qualificationName: MOCK_QUAL.name, eventName: event?.name ?? '' });
  }
});

const MOCK_QUAL: Qualification = {
  id: 'qual-1',
  name: 'First Aid Training',
  eventId: 'event-1',
  teamId: 'first-aid-team',
  errorMessage: 'You must have a valid first aid certificate to qualify for this role.'
};

interface Props {
  params: Promise<{ eventSlug: string; qualificationId: QualificationId }>;
}

export default async function QualificationsPage({ params }: Props) {
  const { eventSlug, qualificationId } = await params;
  const t = await getTranslations(PAGE_KEY);

  const onSave = async (data: FormData) => {
    'use server';
    console.log('Saving qualification with data:', Object.fromEntries(data.entries()));
    // TODO authorisation
    // TODO validation
    // TODO persistence
    redirect(getQualificationDetailsPath({ eventSlug, qualificationId }));
  };

  const onDelete = async (data: FormData) => {
    'use server';
    console.log('Deleting qualification with data:', Object.fromEntries(data.entries()));
    // TODO authorisation
    // TODO validation
    // TODO persistence
    redirect(getQualificationsPath(eventSlug));
  };

  return (
    <Flex p="4" direction="column" gap="6">
      <QualificationDetails qualification={MOCK_QUAL} onSave={onSave} onDelete={onDelete} />
      <Heading size="3" as="h2">
        {t('volunteers')}
      </Heading>
      <VolunteerList />
    </Flex>
  );
}
