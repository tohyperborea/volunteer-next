/**
 * Component for displaying a list of qualifications.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, TextField } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Divider from '../divider';
import QualificationCard from '../qualification-card';
import styles from './styles.module.css';
import { useState } from 'react';
import QualificationDialog from '../qualification-dialog';
import SearchBar from '../search-bar';

interface Props {
  qualifications: QualificationInfo[];
  event: EventInfo;
  teams: TeamInfo[];
  editableTeams?: TeamId[];
  onSave?: (data: FormData) => Promise<never>;
}

export default function QualificationList({
  qualifications,
  event,
  teams,
  editableTeams,
  onSave
}: Props) {
  const t = useTranslations('QualificationList');
  const canEdit = Boolean(onSave);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<QualificationInfo | undefined>(undefined);
  const teamNames = teams.reduce(
    (acc, team) => ({
      ...acc,
      [team.id]: team.name
    }),
    {} as Record<TeamId, string>
  );
  const editableSet = editableTeams ? new Set(editableTeams) : null;
  return (
    <Flex direction="column" gap="4">
      <SearchBar />
      <Divider />
      <Heading size="5" as="h1">
        {t('title')}
      </Heading>
      {canEdit && (
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
      <Flex asChild direction="column" gap="4">
        <ul className={styles.list}>
          {qualifications.map((qualification) => {
            const isEditable =
              canEdit &&
              (!editableSet || (qualification.teamId && editableSet.has(qualification.teamId)));
            return (
              <Box asChild key={qualification.id}>
                <li>
                  <QualificationCard
                    asLink
                    event={event}
                    teamName={qualification.teamId && teamNames[qualification.teamId]}
                    qualification={qualification}
                    onEdit={isEditable ? () => setEditing(qualification) : undefined}
                  />
                </li>
              </Box>
            );
          })}
        </ul>
      </Flex>
      {canEdit && (
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
          onSave={onSave}
        />
      )}
    </Flex>
  );
}
