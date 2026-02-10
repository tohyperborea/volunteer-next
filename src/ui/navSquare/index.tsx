import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import styles from './styles.module.css';

interface NavSquareProps {
  children: ReactNode;
  size?: number;
}

export default function NavSquare({ children }: NavSquareProps) {
  return (
    <Flex direction="column" justify="center" className={styles.navigationSquare} gap="2">
      {children}
    </Flex>
  );
}
