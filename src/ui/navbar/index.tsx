/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Heading, Text, Flex, Box, Avatar } from '@radix-ui/themes';
import styles from './styles.module.css';
import { useState } from 'react';
import NavColumn from './nav-column';
import MobileMenu from './mobile-menu';
import Link from 'next/link';
import { getUserProfilePath } from '@/utils/path';

interface Props {
  title?: string;
  subtitle?: string;
  currentUser: VolunteerInfo;
  children: React.ReactNode;
}

export default function NavBar({ title, subtitle, currentUser, children }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      {/* Navigation bar */}
      <Flex direction="row" align="center" justify="between" className={styles.navigationBar}>
        <Flex display={{ initial: 'flex', sm: 'none' }}>
          <MobileMenu dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} title={title} />
        </Flex>
        <Flex direction="column" justify="center" align="center" className={styles.navigationTitle}>
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

      {/* Content area */}
      <Flex direction="row" style={{ flex: 1 }}>
        <Flex direction="column" display={{ initial: 'none', sm: 'flex' }}>
          <NavColumn title={title} />
        </Flex>
        {children}
      </Flex>
    </>
  );
}
