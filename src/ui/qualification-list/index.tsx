/**
 * Component for displaying a list of qualifications.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import QualificationCard from '../qualification-card';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';

interface Props {
  qualifications: QualificationInfo[];
  event: EventInfo;
  teams: TeamInfo[];
  itemActions?: (qualification: QualificationInfo) => React.ReactNode;
}

export default function QualificationList({ qualifications, event, teams, itemActions }: Props) {
  const t = useTranslations('QualificationList');
  if (qualifications.length === 0) {
    return (
      <Text color="gray" size="2">
        {t('none')}
      </Text>
    );
  }

  const teamNames = teams.reduce(
    (acc, team) => ({
      ...acc,
      [team.id]: team.name
    }),
    {} as Record<TeamId, string>
  );

  return (
    <Flex asChild direction="column" gap="4">
      <ul className={styles.list}>
        {qualifications.map((qualification) => {
          return (
            <Box asChild key={qualification.id}>
              <li>
                <QualificationCard
                  asLink
                  event={event}
                  teamName={qualification.teamId && teamNames[qualification.teamId]}
                  qualification={qualification}
                  actions={itemActions ? itemActions(qualification) : undefined}
                />
              </li>
            </Box>
          );
        })}
      </ul>
    </Flex>
  );
}
