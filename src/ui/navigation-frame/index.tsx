/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Heading, Text, Flex, Avatar, IconButton, Box, Link } from '@radix-ui/themes';
import { useState } from 'react';
import NextLink from 'next/link';
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
          background: 'var(--accent-9)',
          color: 'var(--accent-contrast)',
          boxShadow: 'var(--shadow-2)'
        }}
      >
        <IconButton
          variant="ghost"
          aria-label="Menu"
          style={{ color: 'var(--accent-contrast)' }}
          onClick={() => setIsNavOpen((val) => !val)}
        >
          <HamburgerMenuIcon height={30} width={30} />
        </IconButton>
        <Flex justify="between" align="center" flexGrow="1">
          <Flex direction="column" justify="center">
            <Heading size="3">{title}</Heading>
            <Text size="1">{subtitle}</Text>
          </Flex>
          <NextLink href={getUserProfilePath(currentUser.id)}>
            <Avatar
              fallback={currentUser.displayName.charAt(0).toUpperCase()}
              radius="full"
              variant="solid"
              highContrast
            />
          </NextLink>
        </Flex>
      </Flex>

      {/* Content area */}
      <Flex direction="row" position="relative" overflow="hidden" flexGrow="1">
        <Box
          maxWidth={{ initial: '100vw', sm: '250px' }}
          width={isNavOpen ? '100%' : '0'}
          height="100%"
          style={{
            background: 'var(--color-background)',
            zIndex: 1,
            transition: 'width 0.3s',
            overflow: 'hidden'
          }}
          flexShrink="0"
          position={{ initial: 'absolute', sm: 'relative' }}
          onClick={(e) => {
            // Close on navigation if the menu is fullscreen
            const maxWidthStyle = parseInt(getComputedStyle(e.currentTarget).maxWidth);
            const screenWidth = window.innerWidth;
            const fullscreenMenu = screenWidth <= maxWidthStyle;
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
        <Flex direction="column" overflow="auto" flexGrow="1" justify="between">
          {children}
          <Flex p="4" direction="column" asChild>
            <footer>
              <Text size="1" align="center">
                © 2026{' '}
                <Link
                  href="https://github.com/tohyperborea/volunteer-next"
                  target="_blank"
                  rel="noopener"
                >
                  volunteer-next
                </Link>
                . Licensed under GPLv3.
              </Text>
            </footer>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
