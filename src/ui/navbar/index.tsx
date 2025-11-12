/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Text, Flex, IconButton } from '@radix-ui/themes';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import styles from './styles.module.css';

export default function NavBar() {
  return (
    <nav className={styles.navbar}>
      <Flex justify="between" align="center" height="100%" p="4">
        <Text>volunteer-next</Text>
        <IconButton variant="ghost" size="3" aria-label="Menu">
          <HamburgerMenuIcon />
        </IconButton>
      </Flex>
    </nav>
  );
}
