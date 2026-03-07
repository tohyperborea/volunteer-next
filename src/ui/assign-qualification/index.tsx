/**
 * Component for assigning qualifications to volunteers.
 * Renders a button that opens a dialog
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Button } from '@radix-ui/themes';
import { useState } from 'react';
import VolunteerPicker from '../volunteer-picker';
import { useTranslations } from 'next-intl';
import { PlusIcon } from '@radix-ui/react-icons';

interface Props {
  qualification: QualificationInfo;
  onSubmit?: (data: FormData) => Promise<never>;
}

export default function AssignQualification({ qualification, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('AssignQualification');
  return (
    <Box>
      <Button variant="soft" onClick={() => setOpen(true)}>
        <PlusIcon />
        {t('button')}
      </Button>
      <VolunteerPicker
        title={t('title', { qualificationName: qualification.name })}
        open={open}
        onSubmit={onSubmit}
        onClose={() => setOpen(false)}
        filter={{ withoutQualification: qualification.id }}
      />
    </Box>
  );
}
