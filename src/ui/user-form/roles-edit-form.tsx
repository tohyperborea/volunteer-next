/**
 * RolesEditForm component for displaying and managing user roles.
 * @since 2025-11-14
 * @author Jason Offet <@joffet>
 */

'use client';

import { Text, Box, IconButton, Flex, Tooltip } from '@radix-ui/themes';
import { TrashIcon, CircleBackslashIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import NewRoleRow from './new-role-form';

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

export default function RolesEditForm({
  onDeleteRole,
  onAddRole,
  editingUser,
  events,
  teams,
  currentUserId
}: Props) {
  const t = useTranslations('UserForm');

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
                  <tr key={`${index}-${eventName}-${teamName}`}>
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
          </tbody>
        </table>
      </Box>
      {/* New Role Row in its own table */}
      {onAddRole && editingUser && (
        <NewRoleRow onAddRole={onAddRole} editingUser={editingUser} events={events} teams={teams} />
      )}
    </FormItem>
  );
}
