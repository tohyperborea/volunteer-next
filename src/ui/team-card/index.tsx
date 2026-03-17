/**
 * Team card component
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { getTeamInfoPath } from '@/utils/path';
import { Card, Flex, Heading, Link, Text } from '@radix-ui/themes';

interface Props {
  team: TeamInfo;
  eventSlug: string;
  actions?: React.ReactNode;
}
export default function TeamCard({ team, eventSlug, actions }: Props) {
  return (
    <Card>
      <Flex justify="between" gap="4">
        <Link highContrast underline="none" href={getTeamInfoPath(eventSlug, team.slug)}>
          <Flex direction="column">
            <Heading as="h3" size="4">
              {team.name}
            </Heading>
            <Text>{team.description}</Text>
          </Flex>
        </Link>
        <Flex>{actions}</Flex>
      </Flex>
    </Card>
  );
}
