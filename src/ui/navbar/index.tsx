/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import {
  Heading,
  Text,
  Flex,
  Box
} from '@radix-ui/themes';
import styles from './styles.module.css';
import { useState } from 'react';
import NavColumn from './nav-column';
import MobileMenu from './mobile-menu';

interface Props {
  title?: string;
  subtitle?: string;
  user: User;
  children: React.ReactNode;
}

export default function NavBar({ title, subtitle, user, children }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      {/* Navigation bar */}
      <Flex direction="row" align="center" className={styles.navigationBar}>
        <Flex className={styles.mobileConditionalRender}>
          <MobileMenu dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} title={title} />
        </Flex>
        <Flex direction="column" justify="center" align="center" style={{ flex: 1 }}>
          <Heading size="3">{title}</Heading>
          <Text size="1">{subtitle}</Text>
        </Flex>
        <Box className={styles.navigationUserInitial}>
          <Text>{(user?.name || user?.email)?.charAt(0).toUpperCase()}</Text>
        </Box>
      </Flex>
      
      {/* Content area */}
      <Flex direction="row" style={{ flex: 1 }}>
        <Flex direction="column" className={styles.navigationMenuListOuter}>
          <NavColumn title={title} />
        </Flex>
        {children}
      </Flex>
    </>
  );
}
