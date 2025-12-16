import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import styles from './styles.module.css';

interface NavSquareProps {
  icon: ReactNode;
  text: string;
  size?: number;
}

const DEFAULT_SIZE = 150;

export default function NavSquare({ icon, text, size = DEFAULT_SIZE }: NavSquareProps) {
  return (
    <Flex
      direction="column"
      justify="center"
      className={styles.navigationSquare}
      gap="2"
      style={{ width: size, height: size }}
    >
      {icon}
      <Text>{text}</Text>
    </Flex>
  );
}
