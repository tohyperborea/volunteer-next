/**
 * NewRoleRow component for adding new roles to a user.
 * @since 2025-11-14
 * @author Jason Offet <@joffet>
 */

'use client';

import { Text, Select, IconButton, Flex, Box } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Props {
  onAddRole?: (data: FormData) => Promise<void>;
  editingUser?: User;
  events: EventInfo[];
  teams: TeamInfo[];
  standalone?: boolean; // If true, renders in user create mode for create-user
}

export default function NewRoleRow({
  onAddRole,
  editingUser,
  events,
  teams,
  standalone = false
}: Props) {
  const t = useTranslations('UserForm');
  const [newRoleType, setNewRoleType] = useState('');
  const [newRoleEventId, setNewRoleEventId] = useState('');
  const [newRoleTeamId, setNewRoleTeamId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRoleTypeChange = (value: string) => {
    setNewRoleType(value);
    setValidationError(null);
    // Clear dependent fields when role type changes
    if (value === 'admin') {
      setNewRoleEventId('');
      setNewRoleTeamId('');
    } else if (value === 'organiser') {
      setNewRoleTeamId('');
    }
  };

  const checkDuplicateRole = (): boolean => {
    if (!editingUser || !newRoleType) return false;

    if (newRoleType === 'admin') {
      // Check if user already has an admin role
      const hasAdmin = editingUser.roles.some((role) => role.type === 'admin');
      if (hasAdmin) {
        setValidationError(t('duplicateAdminRole'));
        return true;
      }
    } else if (newRoleType === 'organiser') {
      // Check if user already has an organiser role for this event
      if (!newRoleEventId) return false;
      const hasOrganiser = editingUser.roles.some(
        (role) => role.type === 'organiser' && role.eventId === newRoleEventId
      );
      if (hasOrganiser) {
        setValidationError(t('duplicateOrganiserRole'));
        return true;
      }
    } else if (newRoleType === 'team-lead') {
      // Check if user already has a team-lead role for this event and team
      if (!newRoleEventId || !newRoleTeamId) return false;
      const hasTeamLead = editingUser.roles.some(
        (role) =>
          role.type === 'team-lead' &&
          role.eventId === newRoleEventId &&
          role.teamId === newRoleTeamId
      );
      if (hasTeamLead) {
        setValidationError(t('duplicateTeamLeadRole'));
        return true;
      }
    }
    return false;
  };

  const handleAddRole = async () => {
    if (!newRoleType) return;

    // Validate required fields based on role type
    if (newRoleType === 'organiser' && !newRoleEventId) {
      setValidationError(t('eventRequired'));
      return;
    }
    if (newRoleType === 'team-lead' && (!newRoleEventId || !newRoleTeamId)) {
      setValidationError(t('eventAndTeamRequired'));
      return;
    }

    // Check for duplicate roles (only in user update mode)
    if (editingUser && checkDuplicateRole()) {
      return;
    }

    // In user create mode, we don't call onAddRole - form submission handles it
    if (standalone) {
      // Validation passed, form will submit with the values
      return;
    }

    // In user update mode, call onAddRole
    if (onAddRole && editingUser) {
      setValidationError(null);
      const formData = new FormData();
      formData.append('userId', editingUser.id);
      formData.append('newRoleType', newRoleType);
      if (newRoleEventId) formData.append('newRoleEventId', newRoleEventId);
      if (newRoleTeamId) formData.append('newRoleTeamId', newRoleTeamId);
      await onAddRole(formData);
      // Reset form
      setNewRoleType('');
      setNewRoleEventId('');
      setNewRoleTeamId('');
      setValidationError(null);
    }
  };

  // user create mode: render as table for create-user
  if (standalone) {
    return (
      <Flex direction="column" gap="1">
        <Text as="label" size="2" weight="bold" mb="2">
          {t('roles')}
        </Text>
        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-6)',
                    width: '30%'
                  }}
                >
                  {t('roleType')}
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-6)',
                    width: '30%'
                  }}
                >
                  {t('eventName')}
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-6)',
                    width: '30%'
                  }}
                >
                  {t('teamName')}
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-6)',
                    width: '10%'
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-4)',
                    overflow: 'hidden'
                  }}
                >
                  <Select.Root name="role" value={newRoleType} onValueChange={handleRoleTypeChange}>
                    <Select.Trigger placeholder={t('newRole')} />
                    <Select.Content>
                      <Select.Item value="admin">{t('admin')}</Select.Item>
                      <Select.Item value="organiser">{t('eventOrganiser')}</Select.Item>
                      <Select.Item value="team-lead">{t('teamLead')}</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </td>
                <td
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-4)',
                    overflow: 'hidden'
                  }}
                >
                  <Select.Root
                    name="eventId"
                    value={newRoleEventId}
                    onValueChange={(value) => {
                      setNewRoleEventId(value);
                      setValidationError(null);
                    }}
                    disabled={!newRoleType || newRoleType === 'admin'}
                  >
                    <Select.Trigger placeholder={t('eventName')} />
                    <Select.Content>
                      {events.map((event) => (
                        <Select.Item key={event.id} value={event.id}>
                          {event.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </td>
                <td
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-4)',
                    overflow: 'hidden'
                  }}
                >
                  <Select.Root
                    name="teamId"
                    value={newRoleTeamId}
                    onValueChange={(value) => {
                      setNewRoleTeamId(value);
                      setValidationError(null);
                    }}
                    disabled={
                      !newRoleType || newRoleType === 'admin' || newRoleType === 'organiser'
                    }
                  >
                    <Select.Trigger placeholder={t('teamName')} />
                    <Select.Content>
                      {teams.map((team) => (
                        <Select.Item key={team.id} value={team.id}>
                          {team.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </td>
                <td
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-4)',
                    textAlign: 'center',
                    overflow: 'hidden'
                  }}
                ></td>
              </tr>
              {validationError && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid var(--gray-4)',
                      color: 'var(--red-9)'
                    }}
                  >
                    <Text size="2" color="red">
                      {validationError}
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Flex>
    );
  }

  // user update mode: render as table rows for update-user
  return (
    <>
      <tr>
        <td
          colSpan={4}
          style={{
            padding: '8px',
            borderBottom: '1px solid var(--gray-4)',
            fontWeight: 'bold'
          }}
        >
          {t('addRole')}
        </td>
      </tr>
      <tr>
        <td
          style={{
            padding: '8px',
            borderBottom: '1px solid var(--gray-4)',
            overflow: 'hidden'
          }}
        >
          <Select.Root value={newRoleType} onValueChange={handleRoleTypeChange}>
            <Select.Trigger placeholder={t('newRole')} />
            <Select.Content>
              <Select.Item value="admin">{t('admin')}</Select.Item>
              <Select.Item value="organiser">{t('eventOrganiser')}</Select.Item>
              <Select.Item value="team-lead">{t('teamLead')}</Select.Item>
            </Select.Content>
          </Select.Root>
        </td>
        <td
          style={{
            padding: '8px',
            borderBottom: '1px solid var(--gray-4)',
            overflow: 'hidden'
          }}
        >
          <Select.Root
            value={newRoleEventId}
            onValueChange={(value) => {
              setNewRoleEventId(value);
              setValidationError(null);
            }}
            disabled={!newRoleType || newRoleType === 'admin'}
          >
            <Select.Trigger placeholder={t('eventName')} />
            <Select.Content>
              {events.map((event) => (
                <Select.Item key={event.id} value={event.id}>
                  {event.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </td>
        <td
          style={{
            padding: '8px',
            borderBottom: '1px solid var(--gray-4)',
            overflow: 'hidden'
          }}
        >
          <Select.Root
            value={newRoleTeamId}
            onValueChange={(value) => {
              setNewRoleTeamId(value);
              setValidationError(null);
            }}
            disabled={!newRoleType || newRoleType === 'admin' || newRoleType === 'organiser'}
          >
            <Select.Trigger placeholder={t('teamName')} />
            <Select.Content>
              {teams.map((team) => (
                <Select.Item key={team.id} value={team.id}>
                  {team.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </td>
        <td
          style={{
            padding: '8px',
            borderBottom: '1px solid var(--gray-4)',
            textAlign: 'center',
            overflow: 'hidden'
          }}
        >
          <IconButton
            type="button"
            color="green"
            variant="soft"
            size="1"
            onClick={handleAddRole}
            disabled={!newRoleType}
          >
            <PlusIcon />
          </IconButton>
        </td>
      </tr>
      {validationError && (
        <tr>
          <td
            colSpan={4}
            style={{
              padding: '8px',
              borderBottom: '1px solid var(--gray-4)',
              color: 'var(--red-9)'
            }}
          >
            <Text size="2" color="red">
              {validationError}
            </Text>
          </td>
        </tr>
      )}
    </>
  );
}
