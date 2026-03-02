import { Flex } from '@radix-ui/themes';
import type { ReactNode } from 'react';
import styles from './signin-container.module.css';

interface SigninContainerProps {
  children: ReactNode;
}

export default function SigninContainer({ children }: SigninContainerProps) {
  return (
    <Flex direction="column" gap="2" align="center" className={styles.signinContainer}>
      {children}
    </Flex>
  );
}

