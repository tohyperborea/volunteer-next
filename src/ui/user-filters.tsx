'use client';

import { useState, useEffect } from 'react';
import { Button, Flex, TextField, Select, Link, Checkbox, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { MixerHorizontalIcon, PlusIcon } from '@radix-ui/react-icons';

interface FiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  hasAccessToShowDeleted: boolean;
}

export default function Filters({
  filters,
  onFiltersChange,
  hasAccessToShowDeleted
}: FiltersProps) {
  const t = useTranslations('UsersFilters');
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
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select.Root value={roleType} onValueChange={setRoleType}>
            <Select.Trigger placeholder={t('roleFilterPlaceholder')} />
            <Select.Content>
              <Select.Item value="all">{t('allRoles')}</Select.Item>
              <Select.Item value="admin">{t('admin')}</Select.Item>
              <Select.Item value="organiser">{t('organiser')}</Select.Item>
              <Select.Item value="team-lead">{t('teamLead')}</Select.Item>
            </Select.Content>
          </Select.Root>
          {/* Show deleted users */}
          {hasAccessToShowDeleted && (
            <Flex align="center" gap="2">
              <Checkbox
                checked={showDeleted}
                onCheckedChange={(checked) => setShowDeleted(checked === true)}
              />
              <Text size="2">{t('showDeleted')}</Text>
            </Flex>
          )}
          <Flex gap="2">
            <Button onClick={handleApplyFilters}>{t('applyFilters')}</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              {t('clear')}
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
