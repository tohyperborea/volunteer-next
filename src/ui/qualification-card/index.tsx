/**
 * A card for displaying a qualification
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Card, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import styles from './styles.module.css';
import { Pencil2Icon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { getQualificationDetailsPath } from '@/utils/path';

interface Props {
  qualification: QualificationInfo;
  event: EventInfo;
  teamName?: string;
  onEdit?: () => void;
  asLink?: boolean;
}

export default function QualificationCard({
  qualification,
  onEdit,
  asLink,
  event,
  teamName
}: Props) {
  const Inner = () => (
    <Flex p="3" direction="column" gap="1">
      <Flex justify="between" align="center">
        <Heading size="4" as="h2">
          {qualification.name}
        </Heading>
        {onEdit && (
          <IconButton
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
          >
            <Pencil2Icon width={20} height={20} />
          </IconButton>
        )}
      </Flex>
      <Text color="gray">{event.name}</Text>
      {teamName && <Text color="gray">{teamName}</Text>}
    </Flex>
  );

  return (
    <Card className={styles.card} asChild={asLink}>
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
