/**
 * Display a user's qualifications, with editability for authorised users
 * @since 2026-03-09
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import { IconButton } from '@radix-ui/themes';
import QualificationList from '../qualification-list';
import { useTranslations } from 'next-intl';

interface Props {
  qualifications: QualificationInfo[];
  events: EventInfo[];
  teams: TeamInfo[];
  onRemove?: (qualificationId: QualificationId) => Promise<void>;
  authorised?: boolean;
  authorisedEvents?: EventId[];
  authorisedTeams?: TeamId[];
}

export default function UserQualifications({
  qualifications,
  events,
  teams,
  onRemove,
  authorised = false,
  authorisedEvents = [],
  authorisedTeams = []
}: Props) {
  const t = useTranslations('UserQualifications');
  const eventSet = new Set(authorisedEvents);
  const teamSet = new Set(authorisedTeams);
  return (
    <QualificationList
      qualifications={qualifications}
      events={events}
      teams={teams}
      itemActions={(qual) => {
        const canRemove =
          authorised || eventSet.has(qual.eventId) || (qual.teamId && teamSet.has(qual.teamId));
        return (
          onRemove &&
          canRemove && (
            <IconButton
              aria-label={t('remove', { qualification: qual.name })}
              color="red"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                onRemove(qual.id);
              }}
            >
              <Cross1Icon />
            </IconButton>
          )
        );
      }}
    />
  );
}
