/**
 * Component for creating or editing teams.
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, TextField, Select, Button, TextArea } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FormField } from '../form-dialog';
import DeleteButton from '../delete-button';
import { TEAM_SLUG_PATTERN } from '@/validator/team-validator';

interface Props {
  eventId: EventId;
  onSubmit: (data: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  backOnCancel?: boolean;
  teamleadOptions: VolunteerInfo[];
  editingTeam?: TeamInfo;
  editingTeamlead?: VolunteerInfo;
}

export default function TeamForm({
  eventId,
  onSubmit,
  onDelete,
  backOnCancel,
  teamleadOptions,
  editingTeam,
  editingTeamlead
}: Props) {
  const t = useTranslations('TeamForm');
  const router = useRouter();
  return (
    <Flex asChild direction="column" align="start" gap="6">
      <form>
        {editingTeam && onDelete && (
          <DeleteButton
            variant="soft"
            onDelete={onDelete}
            title={t('delete')}
            description={t('deleteConfirmation', { teamName: editingTeam.name })}
            withText
          />
        )}
        {editingTeam && <input type="hidden" name="id" value={editingTeam.id} />}
        <input type="hidden" name="eventId" value={editingTeam?.eventId || eventId} />
        <Flex direction="column" gap="4">
          <FormField
            name={t('teamName')}
            description={t('teamNameDescription')}
            ariaId="team-name-label"
          >
            <TextField.Root
              name="name"
              aria-labelledby="team-name-label"
              id="team-name"
              placeholder={t('teamName')}
              autoComplete="off"
              defaultValue={editingTeam?.name}
              required
            />
          </FormField>
          <FormField
            ariaId="team-slug-label"
            name={t('teamSlug')}
            description={t('teamSlugDescription')}
          >
            <TextField.Root
              name="slug"
              aria-labelledby="team-slug-label"
              id="team-slug"
              placeholder={t('teamSlug')}
              pattern={TEAM_SLUG_PATTERN}
              autoComplete="off"
              defaultValue={editingTeam?.slug}
              required
            />
          </FormField>
          <FormField
            ariaId="team-description-label"
            name={t('teamDescription')}
            description={t('teamDescriptionDescription')}
          >
            <TextArea
              name="description"
              id="team-description"
              aria-labelledby="team-description-label"
              placeholder={t('teamDescription')}
              defaultValue={editingTeam?.description}
              resize="vertical"
              rows={10}
              required
            />
          </FormField>
          <FormField
            ariaId="contact-address-label"
            name={t('contactAddress')}
            description={t('contactAddressDescription')}
          >
            <TextField.Root
              name="contactAddress"
              aria-labelledby="contact-address-label"
              id="contact-address"
              placeholder={t('contactAddress')}
              autoComplete="off"
              type="email"
              defaultValue={editingTeam?.contactAddress}
              required
            />
          </FormField>
          <FormField
            ariaId="team-lead-label"
            name={t('teamLead')}
            description={t('teamLeadDescription')}
          >
            <Select.Root required name="teamleadId" defaultValue={editingTeamlead?.id}>
              <Select.Trigger placeholder={t('teamLead')} />
              <Select.Content>
                {teamleadOptions.map((volunteer) => (
                  <Select.Item key={volunteer.id} value={volunteer.id}>
                    {volunteer.displayName}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FormField>
          <Flex gap="2" my="6">
            {backOnCancel && (
              <Button
                style={{ maxWidth: '284px', flexBasis: '40%', flexGrow: 1 }}
                variant="soft"
                color="gray"
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                }}
              >
                {t('cancelButton')}
              </Button>
            )}
            <Button
              variant="soft"
              style={{ maxWidth: '284px', flexBasis: '40%', flexGrow: 1 }}
              type="submit"
              formAction={onSubmit}
            >
              {t(editingTeam ? 'updateButton' : 'createButton')}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}
