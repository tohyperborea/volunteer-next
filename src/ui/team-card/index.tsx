/**
 * Team card component
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { useTranslations } from 'next-intl';
import { Text } from '@radix-ui/themes';
import MenuCard from '@/ui/menu-card';

interface Props {
  team: TeamInfo;
  eventSlug: UrlSlug;
  editable?: boolean;
  onDelete?: (id: TeamId) => Promise<void>;
}
export default function TeamCard({ team, eventSlug, editable, onDelete }: Props) {
  const t = useTranslations('TeamCard');

  return (
    <MenuCard
      title={team.name}
      updateUri={editable ? `/event/${eventSlug}/update-team/${team.id}` : undefined}
      onDelete={editable && onDelete ? () => onDelete(team.id) : undefined}
    >
      <Text>{team.description}</Text>
    </MenuCard>
  );
}
