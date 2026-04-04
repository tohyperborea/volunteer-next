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
  event: EventInfo;
  teams: TeamInfo[];
  onRemove?: (qualificationId: QualificationId) => Promise<void>;
  managedQualificationIds?: Set<QualificationId>;
}

export default function UserQualifications({
  qualifications,
  event,
  teams,
  onRemove,
  managedQualificationIds = new Set()
}: Props) {
  const t = useTranslations('UserQualifications');
  return (
    <QualificationList
      qualifications={qualifications}
      event={event}
      teams={teams}
      itemActions={(qual) => {
        const canRemove = managedQualificationIds.has(qual.id);
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
