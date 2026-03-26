/**
 * A card for displaying a qualification
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { getQualificationDetailsPath } from '@/utils/path';
import NextLink from 'next/link';

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
    <Flex justify="between">
      <Flex direction={{ initial: 'column', sm: 'row' }} gap="1" flexGrow="1">
        <Box asChild flexBasis="100%">
          <Heading size="4" as="h3" weight="medium">
            {qualification.name}
          </Heading>
        </Box>
        <Box asChild flexBasis="100%">
          <Text color="gray">{event.name}</Text>
        </Box>
        <Box
          asChild
          flexBasis="100%"
          display={{ initial: teamName ? 'block' : 'none', sm: 'block' }}
        >
          <Text color="gray">{teamName}</Text>
        </Box>
      </Flex>
      {actions}
    </Flex>
  );

  return (
    <Card asChild={asLink} data-testid={cardId}>
      {asLink ? (
        <NextLink href={getQualificationDetailsPath(qualification.id)}>
          <Inner />
        </NextLink>
      ) : (
        <Inner />
      )}
    </Card>
  );
}
