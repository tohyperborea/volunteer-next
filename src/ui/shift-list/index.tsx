/**
 * Displays a list of shifts, with optional admin controls
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { PlusIcon, Share2Icon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import DatedList from '../dated-list';
import ShiftCard from '../shift-card';
import ShiftDialog from '../shift-dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { eventDayToDate } from '@/utils/datetime';
import ShiftFilters from '../shift-filters';
import { canCancelShiftSignup, canSignupForShift } from '@/utils/permissions';

interface Props {
  event: EventInfo;
  teamId: TeamId;
  shifts: ShiftInfo[];
  qualifications: QualificationInfo[];
  shiftVolunteers: Record<ShiftId, VolunteerInfo[]>;
  exportLink: string;
  userShifts?: Set<ShiftId>;
  userQualifications?: Set<QualificationId>;
  editableShifts?: Set<ShiftId>;
  onSaveShift?: (data: FormData) => Promise<void>;
  onDeleteShift?: (shiftId: ShiftId) => Promise<void>;
  onSignup?: (shiftId: ShiftId) => Promise<void>;
  onCancel?: (shiftId: ShiftId) => Promise<void>;
}

export default function ShiftList({
  event,
  teamId,
  shifts,
  qualifications,
  shiftVolunteers,
  exportLink,
  onSaveShift,
  onDeleteShift,
  onSignup,
  onCancel,
  userShifts,
  userQualifications,
  editableShifts
}: Props) {
  const t = useTranslations('ShiftList');
  const canEdit = Boolean(onSaveShift);
  const [creatingShift, setCreatingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftInfo | undefined>(undefined);
  const qualificationMap = new Map(qualifications.map((q) => [q.id, q]));
  const showSignup = (shift: ShiftInfo) =>
    onSignup && userShifts && !userShifts.has(shift.id) && canSignupForShift(event, shift);
  const showCancel = (shift: ShiftInfo) =>
    onCancel && userShifts && userShifts.has(shift.id) && canCancelShiftSignup(event, shift);

  const showEdit = (shift: ShiftInfo) =>
    canEdit && (!editableShifts || editableShifts.has(shift.id));

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
              <a
                href={exportLink}
                rel="noopener noreferrer"
                target="_blank"
                data-umami-event="Export team shifts"
                data-umami-event-teamid={teamId}
              >
                <Share2Icon /> {t('export')}
              </a>
            </Button>
          )}
        </Flex>
      )}
      <Flex direction="column" gap="4">
        <ShiftFilters withFilters={['searchQuery']} />
        <DatedList
          items={shifts}
          getDate={(shift) => eventDayToDate(event.startDate, shift.eventDay)}
          renderItem={(shift) => (
            <ShiftCard
              shift={shift}
              qualification={
                shift.requirement ? qualificationMap.get(shift.requirement) : undefined
              }
              volunteers={shiftVolunteers[shift.id] || []}
              key={shift.id}
              onEdit={showEdit(shift) ? () => setEditingShift(shift) : undefined}
              onSignup={showSignup(shift) ? () => onSignup!(shift.id) : undefined}
              onCancel={showCancel(shift) ? () => onCancel!(shift.id) : undefined}
              isQualified={
                shift.requirement
                  ? userQualifications
                    ? userQualifications.has(shift.requirement)
                    : false
                  : true
              }
            />
          )}
        />
      </Flex>
      {canEdit && (
        <ShiftDialog
          startDate={event.startDate}
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
