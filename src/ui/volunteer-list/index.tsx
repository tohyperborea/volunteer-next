/**
 * Component for displaying a list of volunteers
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Text } from '@radix-ui/themes';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';
import VolunteerCard from '../volunteer-card';
import VolunteerFilters from '../volunteer-filters';

interface Props {
  volunteers: VolunteerInfo[];
  withFilters?: (keyof UserFilters)[];
  itemActions?: Record<UserId, React.ReactNode>;
}

export default function VolunteerList({ volunteers, withFilters = [], itemActions = {} }: Props) {
  const t = useTranslations('VolunteerList');
  return (
    <Flex direction="column" gap="4">
      <VolunteerFilters withFilters={withFilters} />
      {volunteers.length === 0 ? <Text>{t('empty')}</Text> : null}
      <Flex asChild p="0" m="0" direction="column" gap="2">
        <ul className={styles.list}>
          {volunteers.map((volunteer) => (
            <li key={volunteer.id}>
              <VolunteerCard volunteer={volunteer} actions={itemActions[volunteer.id]} />
            </li>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
}
