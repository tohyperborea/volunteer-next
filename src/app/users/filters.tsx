'use client';

import { useState, useEffect } from 'react';
import { Button, Flex, TextField, Select, Link, Checkbox, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { MixerHorizontalIcon, PlusIcon } from '@radix-ui/react-icons';

interface Filters {
  roleType?: string;
  searchQuery?: string;
  showDeleted?: boolean;
}

interface FiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isAdmin: boolean;
}

export default function Filters({ filters, onFiltersChange, isAdmin }: FiltersProps) {
  const t = useTranslations('UsersDashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [roleType, setRoleType] = useState<string>(filters.roleType || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(filters.searchQuery || '');
  const [showDeleted, setShowDeleted] = useState<boolean>(filters.showDeleted ?? false);

  // Sync local state with props when filters change externally
  useEffect(() => {
    setRoleType(filters.roleType || 'all');
    setSearchQuery(filters.searchQuery || '');
    setShowDeleted(filters.showDeleted ?? false);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange({
      roleType: roleType === 'all' ? undefined : roleType,
      searchQuery: searchQuery || undefined,
      showDeleted: showDeleted || undefined
    });
  };

  const handleClearFilters = () => {
    setRoleType('all');
    setSearchQuery('');
    setShowDeleted(false);
    onFiltersChange({});
  };

  return (
    <Flex direction="column" gap="2">
      <Flex direction="row" gap="2" justify="between">
        <Link href="/create-user">
          <Button>
            <PlusIcon /> {t('createUser')}
          </Button>
        </Link>
        <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
          <MixerHorizontalIcon /> {t('filter')}
        </Button>
      </Flex>
      {isOpen && (
        <Flex
          direction="column"
          gap="2"
          p="3"
          style={{ border: '1px solid var(--gray-6)', borderRadius: 'var(--radius-3)' }}
        >
          <TextField.Root
            name="searchQuery"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select.Root value={roleType} onValueChange={setRoleType}>
            <Select.Trigger placeholder="Filter by role..." />
            <Select.Content>
              <Select.Item value="all">All roles</Select.Item>
              <Select.Item value="admin">Admin</Select.Item>
              <Select.Item value="organiser">Organiser</Select.Item>
              <Select.Item value="team-lead">Team Lead</Select.Item>
            </Select.Content>
          </Select.Root>
          {/* Show deleted users - only for admins */}
          {isAdmin && (
            <Flex align="center" gap="2">
              <Checkbox
                checked={showDeleted}
                onCheckedChange={(checked) => setShowDeleted(checked === true)}
              />
              <Text size="2">Show deleted users</Text>
            </Flex>
          )}
          <Flex gap="2">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
