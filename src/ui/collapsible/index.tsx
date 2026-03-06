/**
 * Collapsible section with clickable header
 * @since 2024-02-24
 * @author Michael Townsend <@continuities>
 */
'use client';

import { Flex, Box, Button } from '@radix-ui/themes';
import styles from './styles.module.css';
import { useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface Props {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Collapsible({ header, children, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Box width="100%" className={`${isOpen ? styles.open : ''}`}>
      <Button variant="surface" className={styles.button} onClick={() => setIsOpen(!isOpen)}>
        {header}
        <ChevronDownIcon className={styles.icon} />
      </Button>
      <Box p="2" className={styles.content}>
        {children}
      </Box>
    </Box>
  );
}
