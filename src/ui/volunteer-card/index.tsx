/**
 * Simple card for representing a volunteer in a list or grid.
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

'use client';

import { getUserProfilePath } from '@/utils/path';
import { Avatar, Badge, Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface Props {
  volunteer: VolunteerInfo;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function VolunteerCard({ volunteer, children, actions }: Props) {
  return (
    <Card>
      <Flex justify="between">
        <VolunteerCardContent volunteer={volunteer} children={children} />
        {actions}
      </Flex>
    </Card>
  );
}

export function VolunteerCardContent({ volunteer, children }: Props) {
  const { displayName, fullName, email, roles = [] } = volunteer;
  const roleTypes = [...new Set(roles.map((r) => r.type))];
  return (
    <Flex gap="3" flexGrow="1">
      <Avatar fallback={displayName[0].toUpperCase()} radius="full" />
      <Flex direction="column" justify="center" gap="2" flexGrow="1">
        <Flex direction="column">
          <Link highContrast underline="hover" href={getUserProfilePath(volunteer.id)}>
            <Heading as="h3" size="4" weight="medium">
              {displayName}
            </Heading>
          </Link>
          {fullName && fullName !== displayName && <Text color="gray">{fullName}</Text>}
          {email && <Text color="gray">{email}</Text>}
        </Flex>
        {roles.length > 0 && (
          <Flex wrap="wrap" gap="1">
            {roleTypes.map((type, i) => (
              <RoleBadge key={`role-${i}`} type={type} />
            ))}
          </Flex>
        )}
        {children}
      </Flex>
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
