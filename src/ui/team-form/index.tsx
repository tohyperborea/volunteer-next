/**
 * Component for creating or editing teams.
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Flex, TextField, Button, TextArea, IconButton, Box } from '@radix-ui/themes';
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FormField } from '@/ui/form-dialog';
import DeleteButton from '@/ui/delete-button';
import { TEAM_SLUG_PATTERN } from '@/validator/team-validator';
import { EMAIL_PATTERN } from '@/utils/string';
import VolunteerList from '@/ui/volunteer-list';
import VolunteerPicker from '@/ui/volunteer-picker';

interface Props {
  eventId: EventId;
  onSubmit: (data: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  backOnCancel?: boolean;
  editingTeam?: TeamInfo;
  editingTeamleads?: VolunteerInfo[];
}

export default function TeamForm({
  eventId,
  onSubmit,
  onDelete,
  backOnCancel,
  editingTeam,
  editingTeamleads
}: Props) {
  const t = useTranslations('TeamForm');
  const router = useRouter();
  const [leads, setLeads] = useState<VolunteerInfo[]>(editingTeamleads || []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const removeLeadActions = leads.reduce(
    (actions, volunteer) => {
      actions[volunteer.id] = (
        <IconButton
          variant="ghost"
          color="red"
          onClick={() => setLeads((prev) => prev.filter((v) => v.id !== volunteer.id))}
          aria-label={t('removeLead', { name: volunteer.displayName })}
          title={t('removeLead', { name: volunteer.displayName })}
        >
          <Cross1Icon />
        </IconButton>
      );
      return actions;
    },
    {} as Record<UserId, React.ReactNode>
  );

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
              pattern={EMAIL_PATTERN}
            />
          </FormField>

          <FormField
            ariaId="team-lead-label"
            name={t('teamLead')}
            description={t('teamLeadDescription')}
          >
            {leads.length > 0 && (
              <VolunteerList volunteers={leads} itemActions={removeLeadActions} />
            )}
            {leads.map((lead) => (
              <input
                type="checkbox"
                name="teamleadId"
                value={lead.id}
                key={lead.id}
                hidden
                defaultChecked
              />
            ))}
            {leads.length === 0 && (
              // This input exists only to trigger HTML5 validation if no leads are selected
              <input
                type="checkbox"
                name="teamleadId"
                style={{ opacity: 0, position: 'absolute' }}
                value=""
                required
                onInvalid={(e) => e.currentTarget.setCustomValidity(t('teamLeadRequired'))}
              />
            )}
            <Box mt="1">
              <Button variant="soft" type="button" onClick={() => setPickerOpen(true)}>
                <PlusIcon />
                {t('addLead')}
              </Button>
            </Box>
            <VolunteerPicker
              title={t('addLead')}
              excludeIds={leads.map(({ id }) => id)}
              open={pickerOpen}
              onSelect={(selectedVolunteers) => {
                setLeads((prev) => [...prev, ...selectedVolunteers]);
                setPickerOpen(false);
              }}
              onClose={() => setPickerOpen(false)}
            />
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
