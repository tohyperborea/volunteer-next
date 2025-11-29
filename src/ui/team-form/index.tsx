/**
 * Component for creating or editing teams.
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Text, TextField, Select, Button, TextArea } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="1">
    {children}
  </Flex>
);

interface Props {
  eventId: EventId;
  onSubmit: (data: FormData) => Promise<void>;
  backOnCancel?: boolean;
  teamleadOptions: User[];
  editingTeam?: TeamInfo;
  editingTeamlead?: User;
}

export default function TeamForm({
  eventId,
  onSubmit,
  backOnCancel,
  teamleadOptions,
  editingTeam,
  editingTeamlead
}: Props) {
  const t = useTranslations('TeamForm');
  const router = useRouter();
  return (
    <form action={onSubmit}>
      {editingTeam && <input type="hidden" name="id" value={editingTeam.id} />}
      <input type="hidden" name="eventId" value={editingTeam?.eventId || eventId} />
      <Flex direction="column" gap="4">
        <FormItem>
          <Text as="label" id="team-name-label" htmlFor="team-name" size="2" weight="bold">
            {t('teamName')}
          </Text>
          <TextField.Root
            name="name"
            aria-labelledby="team-name-label"
            id="team-name"
            placeholder={t('teamName')}
            autoComplete="off"
            defaultValue={editingTeam?.name}
            required
          />
        </FormItem>
        <FormItem>
          <Text as="label" id="team-slug-label" htmlFor="team-slug" size="2" weight="bold">
            {t('teamSlug')}
          </Text>
          <TextField.Root
            name="slug"
            aria-labelledby="team-slug-label"
            id="team-slug"
            placeholder={t('teamSlug')}
            autoComplete="off"
            defaultValue={editingTeam?.slug}
            required
          />
        </FormItem>
        <FormItem>
          <Text
            as="label"
            id="team-description-label"
            htmlFor="team-description"
            size="2"
            weight="bold"
          >
            {t('teamDescription')}
          </Text>
          <TextArea
            name="description"
            id="team-description"
            aria-labelledby="team-description-label"
            placeholder={t('teamDescription')}
            defaultValue={editingTeam?.description}
            required
          />
        </FormItem>
        <FormItem>
          <Text as="label" id="team-lead-label" htmlFor="team-lead" size="2" weight="bold">
            {t('teamLead')}
          </Text>
          <Select.Root required name="teamleadId" defaultValue={editingTeamlead?.id}>
            <Select.Trigger placeholder={t('teamLead')} />
            <Select.Content>
              {teamleadOptions.map((user) => (
                <Select.Item key={user.id} value={user.id}>
                  {user.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </FormItem>
        <Flex gap="2" justify="end">
          <Button type="submit">{t(editingTeam ? 'updateButton' : 'createButton')}</Button>
          {backOnCancel && (
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
            >
              {t('cancelButton')}
            </Button>
          )}
        </Flex>
      </Flex>
    </form>
  );
}
