/**
 * A fullscreen dialog for creating/editing a qualification.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

// TODO: Extract Full Screen Dialog and FormField components once PR#18 is merged.

'use client';

import { Button, Dialog, Select, Flex, Heading, Text, TextField, TextArea } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';

interface Props {
  eventId: EventId;
  teams: TeamInfo[];
  editing?: QualificationInfo;
  creating?: boolean;
  onClose?: () => void;
  onSave?: (data: FormData) => Promise<never>;
}

export default function QualificationDialog({
  eventId,
  teams,
  editing,
  creating,
  onClose,
  onSave
}: Props) {
  const isEdit = Boolean(editing);
  const open = creating || isEdit;
  const t = useTranslations('QualificationDialog');
  const title = creating ? t('add') : t('edit');
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Description hidden>{title}</Dialog.Description>
      <Dialog.Content className={styles.fullScreenDialog}>
        <form style={{ height: '100%' }}>
          <input type="hidden" name="eventId" value={eventId} />
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Flex direction="column" gap="4" mt="6" height="100%" width="100%">
            <Dialog.Title as="h2" mt="4" mb="6">
              {title}
            </Dialog.Title>
            <FormField
              ariaId="qualification-name"
              name={t('name')}
              description={t('nameDescription')}
            >
              <TextField.Root
                defaultValue={editing?.name}
                aria-labelledby="qualification-name"
                placeholder={t('namePlaceholder')}
                name="name"
                required
              />
            </FormField>
            <FormField
              ariaId="qualification-team"
              name={t('team')}
              description={t('teamDescription')}
            >
              <Select.Root name="teamId" defaultValue={editing?.teamId ?? 'null'}>
                <Select.Trigger placeholder={t('noTeam')} />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value="null">{t('noTeam')}</Select.Item>
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
                <Button color="gray" variant="soft">
                  {t('cancel')}
                </Button>
              </Dialog.Close>
              <Button variant="soft" formAction={onSave}>
                {t(creating ? 'create' : 'save')}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

interface FormFieldProps {
  ariaId: string;
  name: string;
  description: string;
  children: React.ReactNode;
}

function FormField({ ariaId, name, description, children }: FormFieldProps) {
  return (
    <Flex direction="column" gap="2">
      <Heading as="h3" size="3" id={ariaId}>
        {name}
      </Heading>
      <Text size="1" color="gray">
        {description}
      </Text>
      {children}
    </Flex>
  );
}
