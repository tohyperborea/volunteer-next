import { getEvents, getEventsById } from '@/service/event-service';
import {
  getQualificationsForEvents,
  getQualificationsForTeams
} from '@/service/qualification-service';
import { getTeamsById } from '@/service/team-service';
import { FormField } from '@/ui/form-dialog';
import { deduplicateBy } from '@/utils/list';
import { PlusIcon } from '@radix-ui/react-icons';
import { Flex, Select, Button } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

const PAGE_KEY = 'UserProfilePage';

interface AddQualificationField {
  isAdmin?: boolean;
  organisedEventIds?: EventId[];
  leadTeamIds?: TeamId[];
  hasQualifications?: QualificationInfo[];
  onAdd: (data: FormData) => Promise<void>;
}

export default async function AddQualificationField({
  isAdmin = false,
  organisedEventIds = [],
  leadTeamIds = [],
  hasQualifications = [],
  onAdd
}: AddQualificationField) {
  const t = await getTranslations(PAGE_KEY);
  const omitQualifications = new Set(hasQualifications.map((qualification) => qualification.id));
  const leadTeams = await getTeamsById(leadTeamIds);
  const eventIds = new Set([...leadTeams.map((team) => team.eventId), ...organisedEventIds]);
  const events = isAdmin ? await getEvents() : await getEventsById([...eventIds]);
  const eventNames = events.reduce<Record<EventId, string>>(
    (acc, event) => ({ ...acc, [event.id]: event.name }),
    {}
  );

  const qualifications: QualificationInfo[] = [];
  if (isAdmin) {
    // Admins can assign any qual from all active events
    qualifications.push(...(await getQualificationsForEvents(events.map((event) => event.id))));
  } else {
    if (organisedEventIds.length > 0) {
      // Organisers can assign quals from their events
      qualifications.push(...(await getQualificationsForEvents(organisedEventIds)));
    }
    if (leadTeamIds.length > 0) {
      // Team leads can assign quals from their teams
      qualifications.push(...(await getQualificationsForTeams(leadTeamIds)));
    }
  }

  const qualificationOptions = deduplicateBy(qualifications, ({ id }) => id);

  return (
    <Flex direction="column" gap="2" asChild>
      <form>
        <FormField
          ariaId={'add-qualification'}
          name={t('addQualification')}
          description={t('addQualificationDescription')}
        >
          <Select.Root key={omitQualifications.size} name="qualification-id" required>
            <Select.Trigger placeholder={t('select')} />
            <Select.Content>
              {qualificationOptions.map((qualification) =>
                omitQualifications.has(qualification.id) ? null : (
                  <Select.Item key={qualification.id} value={qualification.id}>
                    {qualification.name} ({eventNames[qualification.eventId]})
                  </Select.Item>
                )
              )}
            </Select.Content>
          </Select.Root>
        </FormField>
        <Button variant="soft" style={{ alignSelf: 'flex-start' }} formAction={onAdd}>
          <PlusIcon />
          {t('assignQualification')}
        </Button>
      </form>
    </Flex>
  );
}
