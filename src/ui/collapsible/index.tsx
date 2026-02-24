/**
 * Collapsible section with clicable header
 * @since 2024-02-24
 * @author Michael Townsend <@continuities>
 */
'use client';

import { Flex, Box } from '@radix-ui/themes';
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
    <Box width="100%" className={`${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <Flex px="2" height="2rem" className={styles.header} align="center" justify="between">
        {header}
        <ChevronDownIcon className={styles.icon} />
      </Flex>
      <Box p="2" className={styles.content}>
        {children}
      </Box>
    </Box>
  );
}
