/**
 * A button that shows a confirmation dialog before performing a delete action.
 * @since 2026-03-16
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Button, Dialog, Flex } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  title: string;
  description: string;
  onDelete: () => Promise<void>;
}

export default function DeleteButton({ title, description, onDelete }: Props) {
  const t = useTranslations('DeleteButton');
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    await onDelete();
    setConfirming(false);
  };

  return (
    <Dialog.Root open={confirming} onOpenChange={setConfirming}>
      <Dialog.Trigger>
        <Button variant="outline" color="red" onClick={() => setConfirming(true)}>
          <TrashIcon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <Flex justify="end" gap="2" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button color="red" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
