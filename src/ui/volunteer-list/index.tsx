/**
 * Component for displaying a list of volunteers
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, IconButton, Text } from '@radix-ui/themes';
import SearchBar from '../search-bar';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';
import VolunteerCard from '../volunteer-card';
import { Cross1Icon } from '@radix-ui/react-icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  volunteers: VolunteerInfo[];
  onRemove?: FormSubmitAction;
}

export default function VolunteerList({ volunteers, onRemove }: Props) {
  const t = useTranslations('VolunteerList');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const onSearch = (search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('searchQuery', search);
    } else {
      params.delete('searchQuery');
    }
    replace(`${pathname}${params.size > 0 ? `?${params.toString()}` : ''}`);
  };
  return (
    <Flex direction="column" gap="4">
      <SearchBar onChange={onSearch} />
      {volunteers.length === 0 ? <Text>{t('empty')}</Text> : null}
      <Flex asChild p="0" m="0" direction="column" gap="2">
        <ul className={styles.list}>
          {volunteers.map((volunteer) => (
            <li key={volunteer.id}>
              <VolunteerCard
                volunteer={volunteer}
                actions={
                  onRemove ? (
                    <form>
                      <input type="hidden" name="volunteerId" value={volunteer.id} />
                      <IconButton
                        variant="ghost"
                        color="red"
                        formAction={onRemove}
                        aria-label={t('remove', { name: volunteer.displayName })}
                        title={t('remove', { name: volunteer.displayName })}
                      >
                        <Cross1Icon />
                      </IconButton>
                    </form>
                  ) : null
                }
              />
            </li>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
}
