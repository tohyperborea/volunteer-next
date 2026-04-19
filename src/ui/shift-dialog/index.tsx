/**
 * A fullscreen dialog for creating/editing a shift.
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Button, Dialog, Flex, TextField, Text, Checkbox, Select } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { EventDaySelect, TimeSelect } from '../datepicker';
import FormDialog, { FormField } from '../form-dialog';
import { useEffect, useState } from 'react';
import DeleteButton from '../delete-button';

interface BaseProps {
  startDate: Date;
  qualifications: QualificationInfo[];
  editing?: PartialBy<ShiftInfo, 'id'>;
  creating?: boolean;
  onClose?: () => void;
  onSubmit?: (data: FormData) => Promise<void>;
  onDelete?: (shiftId: ShiftId) => Promise<void>;
}

type PropsWithTeam = BaseProps & { teamId: TeamId; teams?: never };
type PropsWithoutTeam = BaseProps & { teamId?: never; teams: TeamInfo[] };

type Props = PropsWithTeam | PropsWithoutTeam;

export default function ShiftDialog({
  startDate,
  teamId,
  teams,
  qualifications,
  creating = false,
  editing = undefined,
  onClose,
  onSubmit,
  onDelete
}: Props) {
  const open = creating || Boolean(editing);
  const t = useTranslations('ShiftDialog');
  const title = t(editing ? (editing.id ? 'editShift' : 'copyShift') : 'addShift');
  const [currentMin, setCurrentMin] = useState<number>(editing?.minVolunteers ?? 0);
  const [currentTeam, setCurrentTeam] = useState<TeamId | undefined>(editing?.teamId ?? teamId);
  useEffect(() => {
    if (open) {
      setCurrentTeam(editing?.teamId ?? teamId);
      setCurrentMin(editing?.minVolunteers ?? 0);
    }
  }, [open]);
  const qualificationOptions = qualifications.filter((q) => !q.teamId || q.teamId === currentTeam);
  return (
    <FormDialog description={title} open={open} onClose={onClose}>
      <input type="hidden" name="id" value={editing?.id ?? ''} />
      {teamId && <input type="hidden" name="teamId" value={teamId} />}
      <Flex direction="column" align="start" height="100%">
        <Dialog.Title as="h2" mt="4" mb="6">
          {title}
        </Dialog.Title>

        {editing?.id && editing.id && onDelete && (
          <DeleteButton
            title={t('deleteShift')}
            variant="soft"
            color="red"
            onDelete={async () => {
              await onDelete(editing!.id!); // Guarded in the condition above
              onClose && onClose();
            }}
            description={t('deleteShiftConfirmation')}
            withText
          />
        )}

        <Flex direction="column" gap="4" mt="6" width="100%">
          <Text as="label">
            <Flex gap="2" align="center">
              <Checkbox name="isActive" defaultChecked={editing?.isActive ?? true} />
              {t('active')}
            </Flex>
          </Text>
          {teams && (
            <FormField ariaId="shift-team" name={t('team')} description={t('teamDescription')}>
              <Select.Root
                required
                name="teamId"
                defaultValue={editing?.teamId}
                onValueChange={(value) => setCurrentTeam(value)}
              >
                <Select.Trigger placeholder={t('team')} />
                <Select.Content>
                  {teams.map((team) => (
                    <Select.Item key={team.id} value={team.id}>
                      {team.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </FormField>
          )}
          <FormField ariaId="shift-title" name={t('title')} description={t('titleDescription')}>
            <TextField.Root
              defaultValue={editing?.title}
              aria-labelledby="shift-title"
              name="title"
              placeholder={t('titlePlaceholder')}
              required
            />
          </FormField>
          <FormField ariaId="shift-day" name={t('shiftDay')} description={t('shiftDayDescription')}>
            <EventDaySelect
              startDate={startDate}
              defaultValue={editing?.eventDay ?? 0}
              ariaLabel={t('shiftDay')}
              name="shift-day"
              required
            />
          </FormField>
          <FormField
            ariaId="shift-time"
            name={t('shiftTime')}
            description={t('shiftTimeDescription')}
          >
            <TimeSelect
              defaultValue={editing?.startTime}
              ariaLabel={t('shiftTime')}
              name="shift-time"
              required
            />
          </FormField>
          <FormField ariaId="shift-length" name={t('length')} description={t('lengthDescription')}>
            <TextField.Root
              aria-labelledby="shift-length"
              name="durationHours"
              type="number"
              min={1}
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
              min={0}
              onChange={(e) => {
                const value = Number(e.currentTarget.value);
                if (isNaN(value)) {
                  return;
                }
                setCurrentMin(value);
              }}
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
              min={Math.max(1, currentMin)}
              defaultValue={editing?.maxVolunteers ?? 0}
              required
            />
          </FormField>
          <FormField
            ariaId="shift-requirements"
            name={t('requirements')}
            description={t('requirementsDescription')}
          >
            <Select.Root name="requirement" defaultValue={editing?.requirement ?? 'null'}>
              <Select.Trigger aria-labelledby="shift-requirements" />
              <Select.Content>
                <Select.Group>
                  <Select.Item value="null">{t('none')}</Select.Item>
                </Select.Group>
                <Select.Separator />
                <Select.Group>
                  {qualificationOptions.map((q) => (
                    <Select.Item key={q.id} value={q.id}>
                      {q.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </FormField>
        </Flex>
        <Flex gap="4" mt="auto" py="4">
          <Dialog.Close>
            <Button color="gray" variant="soft" data-umami-event="Cancel shift dialog">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button variant="soft" formAction={onSubmit} data-umami-event="Save shift dialog">
            {t('save')}
          </Button>
        </Flex>
      </Flex>
    </FormDialog>
  );
}
