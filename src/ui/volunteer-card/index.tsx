/**
 * Simple card for representing a volunteer in a list or grid.
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

import { getUserProfilePath } from '@/utils/path';
import { Badge, Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

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
  const { displayName, fullName, email, roles = [] } = volunteer;
  const roleTypes = [...new Set(roles.map((r) => r.type))];
  return (
    <Flex direction="column">
      <Link highContrast underline="hover" href={getUserProfilePath(volunteer.id)}>
        <Heading as="h3" size="4" weight="medium">
          {displayName}
        </Heading>
      </Link>
      {fullName && fullName !== displayName && <Text color="gray">{fullName}</Text>}
      {email && <Text color="gray">{email}</Text>}
      {roles.length > 0 && (
        <Flex wrap="wrap" gap="1" mt="2">
          {roleTypes.map((type, i) => (
            <RoleBadge key={`role-${i}`} type={type} />
          ))}
        </Flex>
      )}
    </Flex>
  );
}

const RoleBadge = ({ type }: { type: UserRoleType }) => {
  const t = useTranslations('RoleBadge');
  return (
    <Badge size="1" variant="outline" color="gray">
      {t(type)}
    </Badge>
  );
};
