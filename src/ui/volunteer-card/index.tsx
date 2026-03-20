/**
 * Simple card for representing a volunteer in a list or grid.
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

'use client';

import { getUserProfilePath } from '@/utils/path';
import { Avatar, Badge, Box, Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';

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
  const showFullName = fullName && fullName !== displayName;
  return (
    <Flex gap="3" flexGrow="1">
      <Avatar size="4" fallback={displayName[0].toUpperCase()} radius="full" />
      <Flex direction="column" justify="center" gap={{ initial: '2', sm: '1' }} flexGrow="1">
        <Flex direction={{ initial: 'column', sm: 'row' }}>
          <Link highContrast underline="hover" asChild>
            <NextLink href={getUserProfilePath(volunteer.id)} style={{ flexBasis: '100%' }}>
              <Heading as="h3" size="4" weight="medium">
                {displayName}
              </Heading>
            </NextLink>
          </Link>
          <Box
            flexBasis="100%"
            display={{ initial: showFullName ? 'block' : 'none', sm: 'block' }}
            asChild
          >
            <Text color="gray">{showFullName ? fullName : ''}</Text>
          </Box>
          <Box
            flexBasis="100%"
            display={{ initial: email ? 'block' : 'none', sm: 'block' }}
            asChild
          >
            <Text color="gray">{email}</Text>
          </Box>
        </Flex>
        {roles.length > 0 && (
          <Flex wrap="wrap" gap="1">
            {roleTypes.map((type, i) => (
              <RoleBadge key={`role-${i}`} type={type} />
            ))}
          </Flex>
        )}
        {children && <Box mt="1">{children}</Box>}
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
