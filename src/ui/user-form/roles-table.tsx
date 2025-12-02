/**
 * RolesTable component for displaying and managing user roles.
 * @since 2025-11-14
 * @author Jason Offet <@joffet>
 */

'use client';

import { Text, Box, Select, IconButton, Flex, Tooltip } from '@radix-ui/themes';
import { TrashIcon, PlusIcon, CircleBackslashIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="1">
    {children}
  </Flex>
);

interface Props {
  onDeleteRole?: (role: UserRole, userId: string) => Promise<void>;
  onAddRole?: (data: FormData) => Promise<void>;
  editingUser?: User;
  events: EventInfo[];
  teams: TeamInfo[];
  currentUserId?: string;
}

export default function RolesTable({
  onDeleteRole,
  onAddRole,
  editingUser,
  events,
  teams,
  currentUserId
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
    if (!onAddRole || !editingUser || !newRoleType) return;

    // Validate required fields based on role type
    if (newRoleType === 'organiser' && !newRoleEventId) {
      setValidationError(t('eventRequired'));
      return;
    }
    if (newRoleType === 'team-lead' && (!newRoleEventId || !newRoleTeamId)) {
      setValidationError(t('eventAndTeamRequired'));
      return;
    }

    // Check for duplicate roles
    if (checkDuplicateRole()) {
      return;
    }

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
  };

  return (
    <FormItem>
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
            {editingUser?.roles
              .slice()
              .sort((a, b) => {
                const getRoleOrder = (type: string) => {
                  if (type === 'admin') return 0;
                  if (type === 'organiser') return 1;
                  if (type === 'team-lead') return 2;
                  return 3;
                };
                return getRoleOrder(a.type) - getRoleOrder(b.type);
              })
              .map((role, index) => {
                const eventName =
                  role.type === 'organiser' || role.type === 'team-lead'
                    ? events.find((e) => e.id === role.eventId)?.name || '-'
                    : '-';
                const teamName =
                  role.type === 'team-lead'
                    ? teams.find((t) => t.id === role.teamId)?.name || '-'
                    : '-';
                return (
                  <tr key={index}>
                    <td
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid var(--gray-4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {role.type === 'admin'
                        ? t('admin')
                        : role.type === 'organiser'
                          ? t('eventOrganiser')
                          : t('teamLead')}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid var(--gray-4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {eventName}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid var(--gray-4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {teamName}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid var(--gray-4)',
                        textAlign: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {onDeleteRole && editingUser && (
                        <>
                          {currentUserId === editingUser.id && role.type === 'admin' ? (
                            <Text size="2" color="gray">
                              <Tooltip content={t('cannotRemoveOwnAdminRole')}>
                                <CircleBackslashIcon />
                              </Tooltip>
                            </Text>
                          ) : (
                            <IconButton
                              type="button"
                              color="red"
                              variant="ghost"
                              size="1"
                              onClick={async () => {
                                await onDeleteRole(role, editingUser.id);
                              }}
                            >
                              <TrashIcon />
                            </IconButton>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            {(!editingUser || editingUser.roles.length === 0) && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--gray-4)',
                    color: 'var(--gray-9)'
                  }}
                >
                  {t('noRoles')}
                </td>
              </tr>
            )}
            {/* New Role Row */}
            {onAddRole && editingUser && (
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
              </>
            )}
            {onAddRole && editingUser && validationError && (
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
    </FormItem>
  );
}
