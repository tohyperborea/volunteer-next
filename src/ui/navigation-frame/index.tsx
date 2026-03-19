/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Heading, Text, Flex, Avatar, IconButton, Box } from '@radix-ui/themes';
import { useState } from 'react';
import Link from 'next/link';
import { getUserProfilePath } from '@/utils/path';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import NavMenu from './navmenu';
import { getPermissionsProfile } from '@/utils/permissions';

interface Props {
  title?: string;
  subtitle?: string;
  currentUser: VolunteerInfo;
  children: React.ReactNode;
}

export default function NavigationFrame({ title, subtitle, currentUser, children }: Props) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const permissionsProfile = getPermissionsProfile(currentUser);
  return (
    <Flex direction="column" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Navigation bar */}
      <Flex
        direction="row"
        flexShrink="0"
        px="4"
        gap="6"
        align="center"
        height="70px"
        style={{
          background: 'var(--color-panel-solid)',
          color: 'var(--color-panel-contrast)',
          boxShadow: 'var(--shadow-2)'
        }}
      >
        <IconButton
          variant="ghost"
          aria-label="Menu"
          highContrast
          onClick={() => setIsNavOpen((val) => !val)}
        >
          <HamburgerMenuIcon height={30} width={30} />
        </IconButton>
        <Flex justify="between" align="center" flexGrow="1">
          <Flex direction="column" justify="center">
            <Heading size="3">{title}</Heading>
            <Text size="1">{subtitle}</Text>
          </Flex>
          <Link href={getUserProfilePath(currentUser.id)}>
            <Avatar
              fallback={currentUser.displayName.charAt(0).toUpperCase()}
              radius="full"
              variant="solid"
            />
          </Link>
        </Flex>
      </Flex>

      {/* Content area */}
      <Flex direction="row" position="relative" overflow="hidden" flexGrow="1">
        <Box
          maxWidth={{ initial: '100vw', md: '250px' }}
          width={isNavOpen ? '100%' : '0'}
          height="100%"
          style={{
            background: 'var(--color-background)',
            zIndex: 1,
            transition: 'width 0.3s',
            overflow: 'hidden'
          }}
          position={{ initial: 'absolute', md: 'relative' }}
          onClick={(e) => {
            // Close on navigation if the menu is fullscreen
            const fullscreenMenu =
              getComputedStyle(e.currentTarget).maxWidth === `${screen.width}px`;
            if (fullscreenMenu) {
              setIsNavOpen(false);
            }
          }}
        >
          <Box
            p="4"
            minWidth="250px"
            style={{
              opacity: isNavOpen ? 1 : 0,
              transition: 'opacity 0.3s, transform 0.3s',
              transform: isNavOpen ? '' : 'translateX(-30px)'
            }}
          >
            <NavMenu permissionsProfile={permissionsProfile} />
          </Box>
        </Box>
        <Box overflow="auto" flexGrow="1">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
