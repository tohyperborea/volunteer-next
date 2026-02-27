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
import DatePicker from '../datepicker';

interface Props {
  editing?: ShiftInfo;
  creating?: boolean;
  onClose?: () => void;
}

export default function ShiftDialog({ creating = false, editing = undefined, onClose }: Props) {
  const isEdit = Boolean(editing);
  const open = creating || isEdit;
  const t = useTranslations('ShiftDialog');
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <Dialog.Content className={styles.fullScreenDialog}>
        <Flex direction="column" align="start" height="100%">
          <Dialog.Title as="h2" mt="4" mb="6">
            {t(editing ? 'editShift' : 'addShift')}
          </Dialog.Title>

          {isEdit && (
            <Button variant="soft" color="red">
              {t('deleteShift')}
            </Button>
          )}
          <Flex direction="column" gap="4" mt="6" width="100%">
            <FormField name={t('title')} description={t('titleDescription')}>
              <TextField.Root name="title" placeholder={t('titlePlaceholder')} />
            </FormField>
            <FormField name={t('startTime')} description={t('startTimeDescription')}>
              <DatePicker name="startTime" />
            </FormField>
            <FormField name={t('length')} description={t('lengthDescription')}>
              <TextField.Root name="length" type="number" defaultValue={0} />
            </FormField>
            <FormField name={t('minVolunteers')} description={t('minVolunteersDescription')}>
              <TextField.Root name="minVolunteers" type="number" defaultValue={0} />
            </FormField>
            <FormField name={t('maxVolunteers')} description={t('maxVolunteersDescription')}>
              <TextField.Root name="maxVolunteers" type="number" defaultValue={0} />
            </FormField>
            <Text as="label">
              <Flex gap="2" align="center">
                <Checkbox name="active" defaultChecked />
                {t('active')}
              </Flex>
            </Text>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft" color="gray" style={{ justifyContent: 'space-between' }}>
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
      </Dialog.Content>
    </Dialog.Root>
  );
}

interface FormFieldProps {
  name: string;
  description: string;
  children: React.ReactNode;
}

function FormField({ name, description, children }: FormFieldProps) {
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
