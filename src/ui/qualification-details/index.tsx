/**
 * Component for displaying details of a single qualification.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { TrashIcon } from '@radix-ui/react-icons';
import QualificationCard from '../qualification-card';
import { Flex, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import QualificationDialog from '../qualification-dialog';
import { useState } from 'react';

interface Props {
  qualification: QualificationInfo;
  event: EventInfo;
  teams: TeamInfo[];
  onSave?: (data: FormData) => Promise<never>;
  onDelete?: (data: FormData) => Promise<never>;
}

export default function QualificationDetails({
  qualification,
  event,
  teams,
  onSave,
  onDelete
}: Props) {
  const t = useTranslations('QualificationDetails');
  const canEdit = Boolean(onSave);
  const [editing, setEditing] = useState<QualificationInfo | undefined>(undefined);
  const teamName = qualification.teamId
    ? teams.find((team) => team.id === qualification.teamId)?.name
    : undefined;
  return (
    <Flex direction="column" gap="4">
      <QualificationCard
        qualification={qualification}
        event={event}
        teamName={teamName}
        onEdit={canEdit ? () => setEditing(qualification) : undefined}
      />
      {onDelete && (
        <form>
          <input type="hidden" name="id" value={qualification.id} />
          <Button variant="ghost" color="red" formAction={onDelete}>
            <TrashIcon />
            {t('delete')}
          </Button>
        </form>
      )}
      {canEdit && (
        <QualificationDialog
          eventId={event.id}
          teams={teams}
          editing={editing}
          onClose={() => {
            setEditing(undefined);
          }}
          onSave={onSave}
        />
      )}
    </Flex>
  );
}
