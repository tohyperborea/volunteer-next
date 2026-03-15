/**
 * Component for displaying a list of qualifications.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Box, Flex } from '@radix-ui/themes';
import QualificationCard from '../qualification-card';
import styles from './styles.module.css';

interface Props {
  qualifications: QualificationInfo[];
  events: EventInfo[];
  teams: TeamInfo[];
  itemActions?: (qualification: QualificationInfo) => React.ReactNode;
}

export default function QualificationList({ qualifications, events, teams, itemActions }: Props) {
  const eventsById = events.reduce<Record<EventId, EventInfo>>(
    (acc, event) => ({
      ...acc,
      [event.id]: event
    }),
    {}
  );

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
                  event={eventsById[qualification.eventId]}
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
