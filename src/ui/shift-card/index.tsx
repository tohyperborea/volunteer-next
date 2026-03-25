/**
 * Info card for a volunteer shift
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import TimeSpan from '../time-span';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';
import Collapsible from '../collapsible';
import { Pencil2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import { addHoursToTimeString } from '@/utils/datetime';
import { getQualificationDetailsPath } from '@/utils/path';
import { useState } from 'react';
import ProgressBar from '../progress-bar';
import NextLink from 'next/link';

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

const getStatusColour = (volunteerCount: number, minVolunteers: number, maxVolunteers: number) => {
  if (volunteerCount >= maxVolunteers) {
    return 'green';
  }
  if (volunteerCount === 0) {
    return 'red';
  }
  if (volunteerCount < minVolunteers) {
    return 'orange';
  }
  return 'accent';
};

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
  const hasButtons = onSignup || onCancel;
  const hasActions = onEdit || collapsible;

  return (
    <Card className={isExpanded ? styles.expanded : undefined}>
      <Flex direction="row" justify="between" gap="3">
        {/* Card content */}
        <Flex direction="column" gap="3" flexGrow="1">
          {/* Responsive content */}
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            align={{ initial: 'stretch', sm: 'start' }}
            gap="3"
          >
            {/* Title and Time */}
            <Flex direction="column">
              <Heading as="h3" size="4" weight="medium">
                {shift.title}
              </Heading>
              <TimeSpan start={startTime} end={endTime} />
            </Flex>
            {/* Spots and Signup */}
            <Flex
              display={{ initial: isExpanded ? 'flex' : 'none', sm: 'flex' }}
              className={collapsible ? styles.transitionOpen : undefined}
              justify="between"
              align={{ initial: 'end', sm: 'center' }}
              flexGrow="1"
              gap="4"
            >
              <Flex direction={{ initial: 'column', sm: 'row' }} flexGrow="1" gap="3" justify="end">
                <Flex direction="row" gap="2" align="center" wrap="wrap">
                  {requirementLabel && (
                    <Badge color="yellow" asChild>
                      <NextLink
                        href={getQualificationDetailsPath({
                          eventSlug: event.slug,
                          qualificationId: shift.requirement!
                        })}
                      >
                        {t('requires')}: {requirementLabel}
                      </NextLink>
                    </Badge>
                  )}
                  <Flex direction="row" gap="2" align="center" wrap="wrap">
                    <Badge color="gray">
                      {t('max')}: {shift.maxVolunteers}
                    </Badge>
                    <Badge color="gray">
                      {t('min')}: {shift.minVolunteers}
                    </Badge>
                  </Flex>
                </Flex>
                <ProgressBar
                  colour={getStatusColour(volunteerCount, shift.minVolunteers, shift.maxVolunteers)}
                  filled={shift.maxVolunteers - volunteerCount}
                  total={shift.maxVolunteers}
                />
              </Flex>
              {hasButtons && (
                <Flex minWidth="110px" justify="end">
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
              )}
            </Flex>
          </Flex>

          {/* Volunteer collapsible */}
          {volunteerCount > 0 && (
            <Flex
              direction="column"
              className={styles.transitionOpen}
              gap="3"
              style={!isExpanded ? { display: 'none' } : undefined}
            >
              <Collapsible header={<Text>{t('volunteers')}</Text>} defaultOpen={collapsible}>
                <Flex direction="column" gap="1">
                  {volunteers.map((volunteer) => (
                    <Text key={volunteer.id}>{volunteer.displayName}</Text>
                  ))}
                </Flex>
              </Collapsible>
            </Flex>
          )}
        </Flex>
        {/* Actions */}
        {hasActions && (
          <Flex
            direction="row"
            gap="4"
            position={{ initial: 'absolute', sm: 'static' }}
            ml={{ initial: '0', sm: '3' }}
            top="3"
            right="3"
          >
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
        )}
      </Flex>
    </Card>
  );
}
