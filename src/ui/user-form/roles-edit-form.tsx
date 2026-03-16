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
import styles from './styles.module.css';

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
      <Box className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.tableHeader} ${styles.tableHeaderLeft}`}>{t('roleType')}</th>
              <th className={`${styles.tableHeader} ${styles.tableHeaderLeft}`}>
                {t('eventName')}
              </th>
              <th className={`${styles.tableHeader} ${styles.tableHeaderLeft}`}>{t('teamName')}</th>
              <th className={`${styles.tableHeader} ${styles.tableHeaderCenter}`}></th>
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
                  <tr
                    key={`${role.type}-${role.type === 'organiser' || role.type === 'team-lead' ? (role.eventId ?? 'none') : 'none'}-${role.type === 'team-lead' ? (role.teamId ?? 'none') : 'none'}`}
                  >
                    <td className={styles.tableCell}>
                      {role.type === 'admin'
                        ? t('admin')
                        : role.type === 'organiser'
                          ? t('eventOrganiser')
                          : t('teamLead')}
                    </td>
                    <td className={styles.tableCell}>{eventName}</td>
                    <td className={styles.tableCell}>{teamName}</td>
                    <td className={styles.tableCellCenter}>
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
                <td colSpan={4} className={styles.tableCellEmpty}>
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
