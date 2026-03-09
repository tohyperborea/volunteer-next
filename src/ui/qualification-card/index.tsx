/**
 * A card for displaying a qualification
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Card, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import styles from './styles.module.css';
import Link from 'next/link';
import { getQualificationDetailsPath } from '@/utils/path';

interface Props {
  qualification: QualificationInfo;
  event: EventInfo;
  teamName?: string;
  asLink?: boolean;
  actions?: React.ReactNode;
}

export default function QualificationCard({
  qualification,
  asLink,
  event,
  teamName,
  actions
}: Props) {
  const cardId = `qualification-card-${qualification.id}`;
  const Inner = () => (
    <Flex p="3" direction="column" gap="1">
      <Flex justify="between" align="center">
        <Heading size="4" as="h3" weight="medium">
          {qualification.name}
        </Heading>
        {actions}
      </Flex>
      <Text color="gray">{event.name}</Text>
      {teamName && <Text color="gray">{teamName}</Text>}
    </Flex>
  );

  return (
    <Card className={styles.card} asChild={asLink} data-testid={cardId}>
      {asLink ? (
        <Link
          href={getQualificationDetailsPath({
            eventSlug: event.slug,
            qualificationId: qualification.id
          })}
        >
          <Inner />
        </Link>
      ) : (
        <Inner />
      )}
    </Card>
  );
}
