/**
 * Component for diplaying a progress bar for shift openings
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';

interface Props {
  filled: number;
  total: number;
}

export default function ProgressBar({ filled, total }: Props) {
  const t = useTranslations('ProgressBar');
  const value = total <= 0 ? 0 : Math.round((filled / total) * 100);
  return (
    <Box className={styles.progress}>
      <Box role="progressbar" className={styles.progressFilled} style={{ width: `${value}%` }} />
      <Text className={styles.progressLabel} weight="medium" size="2">
        {t('label', { filled, total })}
      </Text>
    </Box>
  );
}
