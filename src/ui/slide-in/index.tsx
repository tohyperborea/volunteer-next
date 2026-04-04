'use client';

import { Box } from '@radix-ui/themes';
import styles from './styles.module.css';

export default function SlideIn({ children }: { children: React.ReactNode }) {
  return (
    <Box asChild className={styles.easeInTransition}>
      {children}
    </Box>
  );
}
