'use client';

import DatedList from '@/ui/dated-list';
import ShiftCard from '@/ui/shift-card';
import ShiftDialog from '@/ui/shift-dialog';
import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const PAGE_KEY = 'TeamPage.ShiftsTab';

// TODO: Replace mocks with real data from the backend
const MOCK_SHIFTS: ShiftInfo[] = [
  {
    id: 'mock-shift-1',
    name: 'Morning Setup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-01T08:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 3,
    isActive: true
  },
  {
    id: 'mock-shift-2',
    name: 'Afternoon Cleanup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-01T16:00:00Z'),
    durationHours: 3,
    minVolunteers: 2,
    maxVolunteers: 5,
    isActive: true
  },
  {
    id: 'mock-shift-3',
    name: 'Evening Support',
    teamId: 'mock-team',
    startTime: new Date('2024-07-01T20:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 4,
    isActive: true
  },
  {
    id: 'mock-shift-1',
    name: 'Morning Setup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-02T08:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 3,
    isActive: true
  },
  {
    id: 'mock-shift-2',
    name: 'Afternoon Cleanup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-02T16:00:00Z'),
    durationHours: 3,
    minVolunteers: 2,
    maxVolunteers: 5,
    isActive: true
  },
  {
    id: 'mock-shift-3',
    name: 'Evening Support',
    teamId: 'mock-team',
    startTime: new Date('2024-07-02T20:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 4,
    isActive: true
  }
];

const MOCK_VOLUNTEERS: string[] = ['Foo McFoo', 'Bar Barman'];

interface Props {
  onAddShift?: (shift: ShiftInfo) => void;
  onEditShift?: (shift: ShiftInfo) => void;
  onDeleteShift?: (shiftId: string) => void;
}

export default function TeamShifts({ onAddShift, onEditShift, onDeleteShift }: Props) {
  const t = useTranslations(PAGE_KEY);
  const [creatingShift, setCreatingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftInfo | undefined>(undefined);

  const onSave = (shift: ShiftInfo) => {
    alert('TODO');
  };

  return (
    <Flex direction="column" gap="6">
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
      <DatedList
        items={MOCK_SHIFTS}
        getDate={(shift) => shift.startTime}
        renderItem={(shift) => (
          <ShiftCard
            shift={shift}
            volunteerNames={MOCK_VOLUNTEERS}
            key={shift.id}
            onEdit={() => setEditingShift(shift)}
          />
        )}
      />
      <ShiftDialog
        creating={creatingShift}
        editing={editingShift}
        onClose={() => {
          setCreatingShift(false);
          setEditingShift(undefined);
        }}
      />
    </Flex>
  );
}
