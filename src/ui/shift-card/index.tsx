/**
 * Info card for a volunteer shift
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Link, Text } from '@radix-ui/themes';
import TimeSpan from '../time-span';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';
import Collapsible from '../collapsible';
import { Pencil2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import { addHoursToTimeString } from '@/utils/datetime';
import { getQualificationDetailsPath } from '@/utils/path';
import { useState } from 'react';
import ProgressBar from '../progress-bar';

interface Props {
  event: EventInfo;
  shift: ShiftInfo;
  volunteers: VolunteerInfo[];
  qualification?: QualificationInfo;
  isQualified?: boolean;
  collapsible?: boolean;
  onEdit?: () => void;
  onSignup?: () => void;
  onCancel?: () => void;
}

export default function ShiftCard({
  event,
  shift,
  volunteers,
  qualification,
  onEdit,
  onSignup,
  onCancel,
  collapsible,
  isQualified
}: Props) {
  const t = useTranslations('ShiftCard');
  const startTime = shift.startTime;
  const endTime = addHoursToTimeString(shift.startTime, shift.durationHours);
  const volunteerCount = volunteers.length;
  const requirementLabel =
    shift.requirement && qualification && qualification.id === shift.requirement
      ? qualification.name
      : null;
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const isFull = volunteerCount >= shift.maxVolunteers;
  const cantSignupMessage = isFull
    ? t('full')
    : shift.requirement && !isQualified
      ? qualification?.errorMessage
      : undefined;
  const canSignup = !cantSignupMessage;

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

        <Flex direction="column" gap="3" style={!isExpanded ? { display: 'none' } : undefined}>
          <Flex direction="row" align="center" justify="between">
            <Flex direction="column" gap="3" flexShrink="0" flexGrow="1">
              <Flex direction="row" gap="2">
                <Badge color="gray">
                  {t('max')}: {shift.maxVolunteers}
                </Badge>
                <Badge color="gray">
                  {t('min')}: {shift.minVolunteers}
                </Badge>
              </Flex>
              {requirementLabel && (
                <Box>
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
                </Box>
              )}
              <Box style={{ maxWidth: '200px' }}>
                <ProgressBar filled={volunteerCount} total={shift.maxVolunteers} />
              </Box>
            </Flex>
            {onSignup && (
              <Button disabled={!canSignup} onClick={onSignup} title={cantSignupMessage}>
                {t('signup')}
              </Button>
            )}
            {onCancel && (
              <Button onClick={onCancel} color="red">
                {t('cancel')}
              </Button>
            )}
          </Flex>

          <Box style={{ maxWidth: '600px' }}>
            <Collapsible header={<Text>{t('volunteers')}</Text>}>
              <Flex direction="column" gap="1">
                {volunteers.map((volunteer) => (
                  <Text key={volunteer.id}>{volunteer.displayName}</Text>
                ))}
              </Flex>
            </Collapsible>
          </Box>
        </Flex>
      </Flex>
    </Card>
  );
}
