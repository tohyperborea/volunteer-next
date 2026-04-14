'use client';

import { useState } from 'react';
import ShiftDialog from '@/ui/shift-dialog';
import { Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';

interface Props {
  event: EventInfo;
  teams: TeamInfo[];
  qualifications: QualificationInfo[];
  onSaveShift: (data: FormData) => Promise<void>;
}

export default function AddShiftButton({ event, teams, qualifications, onSaveShift }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('AddShiftButton');
  return (
    <>
      <Button variant="soft" onClick={() => setOpen(true)}>
        <PlusIcon /> {t('addShift')}
      </Button>
      <ShiftDialog
        startDate={event.startDate}
        teams={teams}
        qualifications={qualifications}
        creating={open}
        onSubmit={onSaveShift}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
