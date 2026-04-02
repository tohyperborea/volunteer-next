/**
 * Collapsible section with clickable header
 * @since 2024-02-24
 * @author Michael Townsend <@continuities>
 */
'use client';

import { Box, Button } from '@radix-ui/themes';
import styles from './styles.module.css';
import { useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface Props {
  header: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  defaultOpen?: boolean;
}

export default function Collapsible({
  header,
  children,
  maxWidth = '600px',
  defaultOpen = false
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Box width="100%" style={{ maxWidth }} className={`${isOpen ? styles.open : ''}`}>
      <Button
        variant="surface"
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        data-umami-event={'Toggle collapsible'}
      >
        {header}
        <ChevronDownIcon className={styles.icon} />
      </Button>
      {isOpen && (
        <Box m="2" className={styles.content}>
          {children}
        </Box>
      )}
    </Box>
  );
}
