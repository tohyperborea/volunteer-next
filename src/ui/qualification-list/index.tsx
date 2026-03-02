/**
 * Component for displaying a list of qualifications.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, TextField } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Divider from '../divider';
import QualificationCard from '../qualification-card';
import styles from './styles.module.css';

interface Props {
  qualifications: Qualification[];
  eventName: string;
  teamNames: Record<TeamId, string>;
}

export default function QualificationList({ qualifications, eventName, teamNames }: Props) {
  const t = useTranslations('QualificationList');
  return (
    <Flex direction="column" gap="4">
      <TextField.Root placeholder={t('searchPlaceholder')}>
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>
      <Divider />
      <Heading size="5" as="h1">
        {t('title')}
      </Heading>
      <Button variant="ghost" color="green" style={{ alignSelf: 'flex-start' }}>
        <PlusIcon />
        {t('add')}
      </Button>
      <Flex asChild direction="column" gap="4">
        <ul className={styles.list}>
          {qualifications.map((qualification) => (
            <Box asChild key={qualification.id}>
              <li>
                <QualificationCard
                  asLink
                  eventName={eventName}
                  teamName={qualification.teamId && teamNames[qualification.teamId]}
                  qualification={qualification}
                  onEdit={() => console.log('TODO')}
                />
              </li>
            </Box>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
}
