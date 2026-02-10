import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import styles from './styles.module.css';

interface NavRectangleProps {
  children: ReactNode;
  height?: number;
}

const DEFAULT_HEIGHT = 120;

export default function NavRectangle({ children, height = DEFAULT_HEIGHT }: NavRectangleProps) {
  return (
    <Flex className={styles.navigationRectangle} gap="2" style={{ height: height }}>
      {children}
    </Flex>
  );
}
