/**
 * Sidebar navigation menu
 * @since 2026-03-18
 * @author Michael Townsend <@continuities>
 */

'use client';

import {
  getEventShiftsPath,
  getEventsPath,
  getQualificationsPath,
  getTeamsPath,
  getUsersDashboardPath
} from '@/utils/path';
import { Button, Flex, Text } from '@radix-ui/themes';
import { HomeIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Divider from '../divider';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const VolunteerLinks = [[getTeamsPath('test-event'), 'teams']];

const AdminLinks = [
  [getEventsPath(), 'events'],
  [getQualificationsPath('test-event'), 'qualifications'],
  [getEventShiftsPath('test-event'), 'shifts'],
  [getUsersDashboardPath(), 'volunteers']
];

interface Props {
  permissionsProfile: PermissionsProfile;
}

export default function NavMenu({ permissionsProfile }: Props) {
  const t = useTranslations('NavMenu');
  const pathname = usePathname();
  const showAdminTools =
    permissionsProfile.admin || permissionsProfile.organiser || permissionsProfile['team-lead'];

  const activePath = [...VolunteerLinks, ...(showAdminTools ? AdminLinks : [])].reduce(
    (longest, [path]) => {
      if (pathname.startsWith(path) && path.length > longest.length) {
        return path;
      }
      return longest;
    },
    ''
  );

  return (
    <nav aria-label={t('label')}>
      <Flex asChild direction="column" p="4" m="0" gap="4">
        <ul style={{ listStyle: 'none' }}>
          <li>
            <MenuButton href="/" label={t('home')} icon={<HomeIcon />} />
          </li>
          <li>
            <Divider weight="3" />
          </li>
          {VolunteerLinks.map(([path, text]) => (
            <React.Fragment key={path}>
              <li>
                <MenuButton active={activePath === path} href={path} label={t(text)} />
              </li>
              <li>
                <Divider weight="3" />
              </li>
            </React.Fragment>
          ))}

          {showAdminTools && (
            <>
              <Text size="3" weight="medium" mt="4">
                {t('adminTools')}:
              </Text>
              {AdminLinks.map(([path, text]) => (
                <React.Fragment key={path}>
                  <li>
                    <MenuButton active={activePath === path} href={path} label={t(text)} />
                  </li>
                  <li>
                    <Divider weight="3" />
                  </li>
                </React.Fragment>
              ))}
            </>
          )}
        </ul>
      </Flex>
    </nav>
  );
}

const MenuButton = ({
  href,
  label,
  active,
  icon
}: {
  href: string;
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
}) => (
  <Button
    asChild
    size="3"
    variant="ghost"
    highContrast
    style={{
      width: '100%',
      justifyContent: 'flex-start',
      cursor: active ? 'default' : 'pointer',
      fontWeight: active ? 'bold' : 'normal',
      color: 'var(--gray-12)'
    }}
  >
    <NextLink href={href}>
      {icon}
      {label}
    </NextLink>
  </Button>
);
