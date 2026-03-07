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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('QualificationCard');
  const cardId = `qualification-card-${qualification.id}`;
  const Inner = () => (
    <Flex p="3" direction="column" gap="1">
      <Flex justify="between" align="center">
        <Heading size="4" as="h3" weight="medium">
          {qualification.name}
        </Heading>
        {onEdit && (
          <IconButton
            variant="ghost"
            aria-label={t('edit')}
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
    <Card className={styles.card} asChild={asLink} id={cardId}>
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
