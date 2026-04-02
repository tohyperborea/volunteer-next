/**
 * A fullscreen dialog for creating/editing a qualification.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Button, Dialog, Select, Flex, TextField, TextArea } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import FormDialog, { FormField } from '../form-dialog';

interface Props {
  eventId: EventId;
  teams: TeamInfo[];
  requireTeam?: boolean;
  editing?: QualificationInfo;
  creating?: boolean;
  onClose?: () => void;
  onCreate?: FormSubmitAction;
  onUpdate?: FormSubmitAction;
}

export default function QualificationDialog({
  eventId,
  teams,
  requireTeam,
  editing,
  creating,
  onClose,
  onCreate,
  onUpdate
}: Props) {
  const isEdit = Boolean(editing);
  const open = creating || isEdit;
  const t = useTranslations('QualificationDialog');
  const title = creating ? t('add') : t('edit');
  const defaultTeam = requireTeam ? teams[0]?.id : 'null';
  return (
    <FormDialog description={title} open={open} onClose={onClose}>
      <input type="hidden" name="eventId" value={eventId} />
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <Flex direction="column" gap="4" height="100%" width="100%">
        <Dialog.Title as="h2" mt="4" mb="6">
          {title}
        </Dialog.Title>
        <FormField ariaId="qualification-name" name={t('name')} description={t('nameDescription')}>
          <TextField.Root
            defaultValue={editing?.name}
            aria-labelledby="qualification-name"
            placeholder={t('namePlaceholder')}
            name="name"
            required
          />
        </FormField>
        <FormField ariaId="qualification-team" name={t('team')} description={t('teamDescription')}>
          <Select.Root name="teamId" defaultValue={editing?.teamId ?? defaultTeam}>
            <Select.Trigger placeholder={t('noTeam')} />
            <Select.Content>
              <Select.Group>
                <Select.Item disabled={requireTeam} value="null">
                  {t('noTeam')}
                </Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Group>
                {teams.map((team) => (
                  <Select.Item key={team.id} value={team.id}>
                    {team.name}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </FormField>
        <FormField
          ariaId="qualification-errorMessage"
          name={t('errorMessage')}
          description={t('errorMessageDescription')}
        >
          <TextArea
            defaultValue={editing?.errorMessage}
            aria-labelledby="qualification-errorMessage"
            placeholder={t('errorMessagePlaceholder')}
            name="errorMessage"
            required
          />
        </FormField>
        <Flex gap="4" mt="auto" mb="6">
          <Dialog.Close>
            <Button color="gray" variant="soft" data-umami-event="Cancel qualification dialog">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant="soft"
            formAction={creating ? onCreate : onUpdate}
            data-umami-event="Save qualification dialog"
          >
            {t(creating ? 'create' : 'save')}
          </Button>
        </Flex>
      </Flex>
    </FormDialog>
  );
}
