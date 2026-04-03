/**
 * Component for managing qualifications for an event
 * @since 2026-03-09
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { Flex, Button } from '@radix-ui/themes';
import QualificationList from '../qualification-list';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import QualificationDialog from '../qualification-dialog';
import SearchBar from '../search-bar';

interface Props {
  qualifications: QualificationInfo[];
  event: EventInfo;
  teams: TeamInfo[];
  editableTeams?: TeamId[];
  onCreate?: FormSubmitAction;
  onUpdate?: FormSubmitAction;
}

export default function ManageQualifications({
  qualifications,
  event,
  teams,
  editableTeams,
  onCreate,
  onUpdate
}: Props) {
  const editable = Boolean(onCreate && onUpdate);
  const t = useTranslations('ManageQualifications');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<QualificationInfo | undefined>(undefined);
  const editableSet = editableTeams ? new Set(editableTeams) : null;
  return (
    <Flex direction="column" gap="6">
      {editable && (
        <Button
          variant="ghost"
          color="green"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setCreating(true)}
        >
          <PlusIcon />
          {t('add')}
        </Button>
      )}
      <SearchBar />
      <QualificationList
        qualifications={qualifications}
        event={event}
        teams={teams}
        itemActions={(qualification) => {
          const isEditable =
            editable &&
            (!editableSet || (qualification.teamId && editableSet.has(qualification.teamId)));
          return isEditable ? (
            <Button
              variant="ghost"
              aria-label={t('edit')}
              onClick={(e) => {
                e.preventDefault();
                setEditing(qualification);
              }}
              data-umami-event="Edit qualification"
              data-umami-event-team={qualification.teamId}
              data-umami-event-qualification={qualification.name}
            >
              <Pencil2Icon width={20} height={20} />
            </Button>
          ) : null;
        }}
      />
      <QualificationDialog
        eventId={event.id}
        teams={editableSet ? teams.filter((team) => editableSet.has(team.id)) : teams}
        requireTeam={Boolean(editableSet)}
        editing={editing}
        creating={creating}
        onClose={() => {
          setCreating(false);
          setEditing(undefined);
        }}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Flex>
  );
}
