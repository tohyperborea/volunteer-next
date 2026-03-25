/**
 * Component for displaying a progress bar for shift openings
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
  colour?: string;
  maxWidth?: string;
}

export default function ProgressBar({
  filled,
  total,
  colour = 'accent',
  maxWidth = '200px'
}: Props) {
  const t = useTranslations('ProgressBar');
  const value = total <= 0 ? 0 : Math.round((filled / total) * 100);
  return (
    <Box
      width="100%"
      className={styles.progress}
      style={
        {
          maxWidth,
          '--progress-fill-colour': `var(--${colour}-9)`,
          '--progress-background-colour': `var(--${colour}-a5)`
        } as React.CSSProperties
      }
    >
      <Box
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className={styles.progressFilled}
        style={{ width: `${value}%` }}
      />
      <Text className={styles.progressLabel} weight="medium" size="2">
        {t('label', { filled, total })}
      </Text>
    </Box>
  );
}
