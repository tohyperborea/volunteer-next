/**
 * A fullscreen dialog for creating/editing a shift.
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import {
  Button,
  Dialog,
  Flex,
  Heading,
  TextField,
  Text,
  Checkbox,
  DropdownMenu
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';
import { EventDayTimePicker } from '../datepicker';
import { eventDayTimeToDate } from '@/utils/datetime';

interface Props {
  startDate: Date;
  teamId: TeamId;
  editing?: ShiftInfo;
  creating?: boolean;
  onClose?: () => void;
  onSubmit?: (data: FormData) => Promise<never>;
  onDelete?: (data: FormData) => Promise<never>;
}

export default function ShiftDialog({
  startDate,
  teamId,
  creating = false,
  editing = undefined,
  onClose,
  onSubmit,
  onDelete
}: Props) {
  const isEdit = Boolean(editing);
  const open = creating || isEdit;
  const t = useTranslations('ShiftDialog');
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <Dialog.Content className={styles.fullScreenDialog}>
        <form action={onSubmit} style={{ height: '100%' }}>
          <input type="hidden" name="id" value={editing?.id ?? ''} />
          <input type="hidden" name="teamId" value={teamId} />
          <Flex direction="column" align="start" height="100%">
            <Dialog.Title as="h2" mt="4" mb="6">
              {t(editing ? 'editShift' : 'addShift')}
            </Dialog.Title>

            {isEdit && onDelete && (
              <Button variant="soft" color="red" formAction={onDelete}>
                {t('deleteShift')}
              </Button>
            )}

            <Flex direction="column" gap="4" mt="6" width="100%">
              <FormField ariaId="shift-title" name={t('title')} description={t('titleDescription')}>
                <TextField.Root
                  defaultValue={editing?.title}
                  aria-labelledby="shift-title"
                  name="title"
                  placeholder={t('titlePlaceholder')}
                  required
                />
              </FormField>
              <FormField
                ariaId="shift-start"
                name={t('startTime')}
                description={t('startTimeDescription')}
              >
                <EventDayTimePicker
                  startDate={startDate}
                  defaultValue={editing && { day: editing.eventDay, time: editing.startTime }}
                  aria-labelledby="shift-start"
                  name="startTime"
                  required
                />
              </FormField>
              <FormField
                ariaId="shift-length"
                name={t('length')}
                description={t('lengthDescription')}
              >
                <TextField.Root
                  aria-labelledby="shift-length"
                  name="durationHours"
                  type="number"
                  defaultValue={editing?.durationHours ?? 0}
                  required
                />
              </FormField>
              <FormField
                ariaId="min-volunteers"
                name={t('minVolunteers')}
                description={t('minVolunteersDescription')}
              >
                <TextField.Root
                  aria-labelledby="min-volunteers"
                  name="minVolunteers"
                  type="number"
                  defaultValue={editing?.minVolunteers ?? 0}
                  required
                />
              </FormField>
              <FormField
                ariaId="max-volunteers"
                name={t('maxVolunteers')}
                description={t('maxVolunteersDescription')}
              >
                <TextField.Root
                  aria-labelledby="max-volunteers"
                  name="maxVolunteers"
                  type="number"
                  defaultValue={editing?.maxVolunteers ?? 0}
                  required
                />
              </FormField>
              <Text as="label">
                <Flex gap="2" align="center">
                  <Checkbox name="isActive" defaultChecked={editing?.isActive ?? true} />
                  {t('active')}
                </Flex>
              </Text>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button
                    variant="soft"
                    color="gray"
                    style={{ justifyContent: 'space-between' }}
                    onClick={() => console.log('TODO')}
                  >
                    {t('requirementId')}
                    <DropdownMenu.TriggerIcon />
                  </Button>
                </DropdownMenu.Trigger>
              </DropdownMenu.Root>
            </Flex>
            <Flex gap="4" mt="auto" mb="6">
              <Dialog.Close>
                <Button color="gray" variant="soft">
                  {t('cancel')}
                </Button>
              </Dialog.Close>
              <Button variant="soft">{t('save')}</Button>
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
      <Heading as="h3" size="3">
        {name}
      </Heading>
      <Text size="1" color="gray">
        {description}
      </Text>
      {children}
    </Flex>
  );
}
