/**
 * Info card for a volunteer shift
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Badge, Box, Card, Flex, Heading, IconButton, Link, Text } from '@radix-ui/themes';
import TimeSpan from '../time-span';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';
import Collapsible from '../collapsible';
import { Pencil2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import { addHoursToTimeString } from '@/utils/datetime';
import { getQualificationDetailsPath } from '@/utils/path';
import { useState } from 'react';

interface Props {
  event: EventInfo;
  shift: ShiftInfo;
  qualification?: QualificationInfo;
  volunteerNames: string[];
  collapsible?: boolean;
  onEdit?: () => void;
}

export default function ShiftCard({
  event,
  shift,
  volunteerNames,
  qualification,
  onEdit,
  collapsible
}: Props) {
  const t = useTranslations('ShiftCard');
  const startTime = shift.startTime;
  const endTime = addHoursToTimeString(shift.startTime, shift.durationHours);
  const volunteerCount = volunteerNames.length;
  const requirementLabel =
    shift.requirement && qualification && qualification.id === shift.requirement
      ? qualification.name
      : null;
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  return (
    <Card className={isExpanded ? styles.expanded : undefined}>
      <Flex direction="column" gap="3">
        <Flex direction="column">
          <Flex justify="between" align="center">
            <Heading as="h3" size="4" weight="medium">
              {shift.title}
            </Heading>
            <Flex direction="row" gap="4">
              {onEdit && (
                <IconButton aria-label={t('editShift')} variant="ghost" onClick={onEdit}>
                  <Pencil2Icon width={20} height={20} />
                </IconButton>
              )}
              {collapsible && (
                <IconButton
                  variant="ghost"
                  aria-label={isExpanded ? t('collapse') : t('expand')}
                  aria-expanded={isExpanded}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded((prev) => !prev);
                  }}
                >
                  <ChevronDownIcon className={styles.collapse} />
                </IconButton>
              )}
            </Flex>
          </Flex>
          <TimeSpan start={startTime} end={endTime} />
        </Flex>
        <Flex
          direction="column"
          gap="3"
          align="start"
          style={!isExpanded ? { display: 'none' } : undefined}
        >
          <Flex direction="row" gap="2">
            <Badge color="gray">
              {t('max')}: {shift.maxVolunteers}
            </Badge>
            <Badge color="gray">
              {t('min')}: {shift.minVolunteers}
            </Badge>
          </Flex>
          <Badge color="teal">{t('status').toUpperCase()}</Badge>
          {requirementLabel && (
            <Badge asChild>
              <Link
                color="orange"
                href={getQualificationDetailsPath({
                  eventSlug: event.slug,
                  qualificationId: shift.requirement!
                })}
              >
                {t('requires')}: {requirementLabel}
              </Link>
            </Badge>
          )}
          <ShiftProgress filled={volunteerCount} total={shift.maxVolunteers} />
          <Collapsible header={<Text>{t('volunteers')}</Text>}>
            <Flex direction="column" gap="1">
              {volunteerNames.map((name) => (
                <Text key={name}>{name}</Text>
              ))}
            </Flex>
          </Collapsible>
        </Flex>
      </Flex>
    </Card>
  );
}

const ShiftProgress = ({ filled, total }: { filled: number; total: number }) => {
  const t = useTranslations('ShiftCard');
  const value = total <= 0 ? 0 : Math.round((filled / total) * 100);
  return (
    <Box className={styles.shiftProgress}>
      <Box className={styles.shiftProgressFilled} style={{ width: `${value}%` }} />
      <Text
        className={styles.shiftProgressLabel}
        weight="medium"
        size="2"
      >{`${filled}/${total} ${t('spots')}`}</Text>
    </Box>
  );
};
