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
  onDelete: (id: TeamId) => Promise<void>;
}
export default function TeamCard({ team, onDelete }: Props) {
  const t = useTranslations('TeamCard');

  return (
    <MenuCard
      title={team.name}
      updateUri={`/update-team/${team.id}`}
      onDelete={() => onDelete(team.id)}
    >
      <Text>{team.description}</Text>
    </MenuCard>
  );
}
