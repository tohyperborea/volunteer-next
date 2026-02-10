import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import styles from './styles.module.css';

interface NavSquareProps {
  children: ReactNode;
  size?: number;
}

const DEFAULT_SIZE = 120;

export default function NavSquare({ children, size = DEFAULT_SIZE }: NavSquareProps) {
  return (
    <Flex
      direction="column"
      justify="center"
      className={styles.navigationSquare}
      gap="2"
      style={{ width: size, height: size }}
    >
      {children}
    </Flex>
  );
}
