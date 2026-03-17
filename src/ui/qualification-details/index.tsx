/**
 * Component for displaying details of a single qualification.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import QualificationCard from '../qualification-card';
import { Flex, Button, Box } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import QualificationDialog from '../qualification-dialog';
import { useState } from 'react';
import DeleteButton from '../delete-button';

interface Props {
  qualification: QualificationInfo;
  event: EventInfo;
  teams: TeamInfo[];
  onSave?: (data: FormData) => Promise<never>;
  onDelete?: () => Promise<never>;
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
        actions={
          canEdit && (
            <Button
              variant="ghost"
              aria-label={t('edit')}
              onClick={(e) => {
                e.preventDefault();
                setEditing(qualification);
              }}
            >
              <Pencil2Icon width={20} height={20} />
            </Button>
          )
        }
      />
      {onDelete && (
        <Box>
          <DeleteButton
            variant="ghost"
            color="red"
            onDelete={onDelete}
            title={t('delete')}
            description={t('deleteConfirmation', { qualificationName: qualification.name })}
            withText
          />
        </Box>
      )}
      {canEdit && (
        <QualificationDialog
          eventId={event.id}
          teams={teams}
          editing={editing}
          onClose={() => {
            setEditing(undefined);
          }}
          onUpdate={onSave}
        />
      )}
    </Flex>
  );
}
