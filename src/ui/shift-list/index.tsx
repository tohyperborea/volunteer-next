/**
 * Displays a list of shifts, with optional admin controls
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import DatedList from '../dated-list';
import ShiftCard from '../shift-card';
import ShiftDialog from '../shift-dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { eventDayToDate } from '@/utils/datetime';

interface Props {
  startDate: Date;
  teamId: TeamId;
  shifts: ShiftInfo[];
  onSaveShift?: (data: FormData) => Promise<never>;
  onDeleteShift?: (data: FormData) => Promise<never>;
}

export default function ShiftList({
  startDate,
  teamId,
  shifts,
  onSaveShift,
  onDeleteShift
}: Props) {
  const t = useTranslations('ShiftList');
  const canEdit = Boolean(onSaveShift);
  const [creatingShift, setCreatingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftInfo | undefined>(undefined);
  return (
    <Flex direction="column" gap="6">
      {canEdit && (
        <Flex direction="row" gap="2">
          <Button
            onClick={() => {
              setEditingShift(undefined);
              setCreatingShift(true);
            }}
          >
            <PlusIcon /> {t('addShift')}
          </Button>
          <Button>
            <PlusIcon /> {t('importShift')}
          </Button>
        </Flex>
      )}
      <DatedList
        items={shifts}
        getDate={(shift) => eventDayToDate(startDate, shift.eventDay)}
        renderItem={(shift) => (
          <ShiftCard
            shift={shift}
            volunteerNames={[] /* TODO */}
            key={shift.id}
            onEdit={canEdit ? () => setEditingShift(shift) : undefined}
          />
        )}
      />
      {canEdit && (
        <ShiftDialog
          startDate={startDate}
          teamId={teamId}
          creating={creatingShift}
          editing={editingShift}
          onSubmit={onSaveShift}
          onDelete={onDeleteShift}
          onClose={() => {
            setCreatingShift(false);
            setEditingShift(undefined);
          }}
        />
      )}
    </Flex>
  );
}
