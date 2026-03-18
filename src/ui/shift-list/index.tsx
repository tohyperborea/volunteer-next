/**
 * Displays a list of shifts, with optional admin controls
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { PlusIcon, Share2Icon } from '@radix-ui/react-icons';
import { Button, Flex, Link } from '@radix-ui/themes';
import DatedList from '../dated-list';
import ShiftCard from '../shift-card';
import ShiftDialog from '../shift-dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { eventDayToDate } from '@/utils/datetime';
import ShiftFilters from '../shift-filters';

interface Props {
  event: EventInfo;
  startDate: Date;
  teamId: TeamId;
  shifts: ShiftInfo[];
  qualifications: QualificationInfo[];
  exportLink: string;
  onSaveShift?: (data: FormData) => Promise<void>;
  onDeleteShift?: (shiftId: ShiftId) => Promise<void>;
}

export default function ShiftList({
  event,
  startDate,
  teamId,
  shifts,
  qualifications,
  exportLink,
  onSaveShift,
  onDeleteShift
}: Props) {
  const t = useTranslations('ShiftList');
  const canEdit = Boolean(onSaveShift);
  const [creatingShift, setCreatingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftInfo | undefined>(undefined);
  const qualificationMap = new Map(qualifications.map((q) => [q.id, q]));
  return (
    <Flex direction="column" gap="6">
      {canEdit && (
        <Flex direction="row" gap="2">
          <Button
            variant="soft"
            onClick={() => {
              setEditingShift(undefined);
              setCreatingShift(true);
            }}
          >
            <PlusIcon /> {t('addShift')}
          </Button>
          {exportLink && (
            <Button variant="soft" asChild>
              <Link href={exportLink} rel="noopener noreferrer" target="_blank">
                <Share2Icon /> {t('export')}
              </Link>
            </Button>
          )}
        </Flex>
      )}
      <Flex direction="column" gap="4">
        <ShiftFilters withFilters={['searchQuery']} />
        <DatedList
          items={shifts}
          getDate={(shift) => eventDayToDate(startDate, shift.eventDay)}
          renderItem={(shift) => (
            <ShiftCard
              event={event}
              shift={shift}
              qualification={
                shift.requirement ? qualificationMap.get(shift.requirement) : undefined
              }
              volunteerNames={[] /* TODO */}
              key={shift.id}
              onEdit={canEdit ? () => setEditingShift(shift) : undefined}
            />
          )}
        />
      </Flex>
      {canEdit && (
        <ShiftDialog
          startDate={startDate}
          teamId={teamId}
          qualifications={qualifications}
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
