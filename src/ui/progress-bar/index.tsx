/**
 * Component for displaying a progress bar for shift openings
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';
import { PersonIcon } from '@radix-ui/react-icons';

interface Props {
  filled: number;
  total: number;
  colour?: string;
  needed?: number;
}

export default function ProgressBar({ filled, total, colour = 'accent', needed = 0 }: Props) {
  const t = useTranslations('ProgressBar');
  const value = total <= 0 ? 0 : Math.round((filled / total) * 100);
  return (
    <Flex width="100%" direction="column">
      <Box
        className={styles.progress}
        style={
          {
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
          <Flex align="center" gap="1">
            {filled}/{total} <PersonIcon />
          </Flex>
        </Text>
      </Box>
      {needed > 0 && (
        <Text color="amber" size="2" mt="1">
          {t('needed', { needed })}
        </Text>
      )}
    </Flex>
  );
}
