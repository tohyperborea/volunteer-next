/**
 * NewRoleForm component for adding new roles to a user.
 * @since 2025-11-14
 * @author Jason Offet <@joffet>
 */

'use client';

import { Text, Select, Button, Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { rolesEq } from '@/session';

interface Props {
  onAddRole?: (data: FormData) => Promise<void>;
  editingUser?: User;
  events: EventInfo[];
  teams: TeamInfo[];
}

export default function NewRoleForm({ onAddRole, editingUser, events, teams }: Props) {
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
      const newRole: UserRole = { type: 'admin' };
      const hasAdmin = editingUser.roles.some((role) => rolesEq(role, newRole));
      if (hasAdmin) {
        setValidationError(t('duplicateAdminRole'));
        return true;
      }
    } else if (newRoleType === 'organiser') {
      // Check if user already has an organiser role for this event
      if (!newRoleEventId) return false;
      const newRole: UserRole = {
        type: 'organiser',
        eventId: newRoleEventId
      };
      const hasOrganiser = editingUser.roles.some((role) => rolesEq(role, newRole));
      if (hasOrganiser) {
        setValidationError(t('duplicateOrganiserRole'));
        return true;
      }
    } else if (newRoleType === 'team-lead') {
      // Check if user already has a team-lead role for this event and team
      if (!newRoleEventId || !newRoleTeamId) return false;
      const newRole: UserRole = {
        type: 'team-lead',
        eventId: newRoleEventId,
        teamId: newRoleTeamId
      };
      const hasTeamLead = editingUser.roles.some((role) => rolesEq(role, newRole));
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
    // In user create mode, validation passed - form submission handles it
  };

  // Determine if this is create mode (no onAddRole) or update mode (has onAddRole)
  const isCreateMode = !onAddRole;

  return (
    <Flex direction="column" gap="1" mb="8" mt="4">
      <Text as="label" size="2" weight="bold" mb="2">
        {t('addRole')}
      </Text>
      <Flex
        direction={{ initial: 'column', sm: 'row' }}
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        gap={{ initial: '4', sm: '2' }}
      >
        {/* Role Type Select */}
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="bold" mb="2">
            {t('roleType')}
          </Text>
          <Select.Root
            name={isCreateMode ? 'role' : undefined}
            value={newRoleType}
            onValueChange={handleRoleTypeChange}
          >
            <Select.Trigger placeholder={t('newRole')} />
            <Select.Content>
              <Select.Item value="admin">{t('admin')}</Select.Item>
              <Select.Item value="organiser">{t('eventOrganiser')}</Select.Item>
              <Select.Item value="team-lead">{t('teamLead')}</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
        {/* Event Select */}
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="bold" mb="2">
            {t('eventName')}
          </Text>
          <Select.Root
            name={isCreateMode ? 'eventId' : undefined}
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
        </Flex>
        {/* Team Select */}
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="bold" mb="2">
            {t('teamName')}
          </Text>
          <Select.Root
            name={isCreateMode ? 'teamId' : undefined}
            value={newRoleTeamId}
            onValueChange={(value) => {
              setNewRoleTeamId(value);
              setValidationError(null);
            }}
            disabled={!newRoleType || newRoleType === 'admin' || newRoleType === 'organiser'}
          >
            <Select.Trigger placeholder={t('teamName')} />
            <Select.Content>
              {teams
                .filter((team) => team.eventId === newRoleEventId)
                .map((team) => (
                  <Select.Item key={team.id} value={team.id}>
                    {team.name}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        </Flex>
        {/* Validation Error */}
        {validationError && (
          <Flex direction="column" gap="1">
            <Text size="2" color="red">
              {validationError}
            </Text>
          </Flex>
        )}
        {/* Add Role Button */}
        <Flex direction="row" gap="1" width={{ initial: '100%', sm: 'auto' }} justify="end">
          <Button type="button" variant="soft" onClick={handleAddRole} disabled={!newRoleType}>
            <PlusIcon />
            {t('addRole')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
