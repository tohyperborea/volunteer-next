/**
 * Simple card for representing a volunteer in a list or grid.
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

import { Card, Flex, Heading, Text } from '@radix-ui/themes';

interface Props {
  volunteer: VolunteerInfo;
  actions?: React.ReactNode;
}

export default function VolunteerCard({ volunteer, actions }: Props) {
  return (
    <Card>
      <Flex justify="between">
        <VolunteerCardContent volunteer={volunteer} />
        {actions}
      </Flex>
    </Card>
  );
}

export function VolunteerCardContent({ volunteer }: Props) {
  const { displayName, fullName, email } = volunteer;
  return (
    <Flex direction="column">
      <Heading as="h3" size="4" weight="medium">
        {displayName}
      </Heading>
      {fullName && fullName !== displayName && <Text color="gray">{fullName}</Text>}
      {email && <Text color="gray">{email}</Text>}
    </Flex>
  );
}
