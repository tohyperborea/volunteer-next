/**
 * Component for a vertical menu of links
 * @since 2026-03-03
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Button, Flex } from '@radix-ui/themes';
import { useState } from 'react';
import styles from './styles.module.css';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export interface Props {
  children?: React.ReactNode[];
}

export default function LinkMenu({ children }: Props) {
  return (
    <Flex direction={'column'} gap="2" p="0" asChild>
      <ul className={styles.list}>
        {children?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </Flex>
  );
}

export interface SubLinkMenuProps {
  title: string;
  children?: React.ReactNode[];
}

export function SubLinkMenu({ title, children }: SubLinkMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Flex className={isOpen ? styles.open : ''} direction={'column'}>
      <Flex asChild justify="between">
        <Button color="gray" variant="soft" size="3" onClick={() => setIsOpen((open) => !open)}>
          {title}
          <ChevronDownIcon className={styles.icon} />
        </Button>
      </Flex>
      <Flex direction={'column'} gap="2" p="4" asChild>
        <ul className={`${styles.sublist} ${styles.list}`}>
          {children?.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
}
