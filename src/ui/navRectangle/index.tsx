import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import styles from './styles.module.css';

interface NavRectangleProps {
  children: ReactNode;
  height?: number;
}


export default function NavRectangle({ children }: NavRectangleProps) {
  return (
    <Flex className={styles.navigationRectangle} gap="2">
      {children}
    </Flex>
  );
}
