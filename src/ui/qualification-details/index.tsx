/**
 * Component for displaying details of a single qualification.
 * @since 2026-03-02
 * @author Michael Townsend <@continuities>
 */

'use client';

import { TrashIcon } from '@radix-ui/react-icons';
import QualificationCard from '../qualification-card';
import { Flex, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface Props {
  qualification: Qualification;
  eventName: string;
  teamName?: string;
  onSave?: (data: FormData) => Promise<never>;
  onDelete?: (data: FormData) => Promise<never>;
}

export default function QualificationDetails({
  qualification,
  eventName,
  teamName,
  onSave,
  onDelete
}: Props) {
  const t = useTranslations('QualificationDetails');
  return (
    <Flex direction="column" gap="4">
      <QualificationCard
        qualification={qualification}
        eventName={eventName}
        teamName={teamName}
        onEdit={onSave ? () => console.log('TODO') : undefined}
      />
      {onDelete && (
        <form>
          <Button variant="ghost" color="red" formAction={onDelete}>
            <TrashIcon />
            {t('delete')}
          </Button>
        </form>
      )}
    </Flex>
  );
}
