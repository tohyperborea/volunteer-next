/**
 * A fullscreen dialog for creating/editing a shift.
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Button, Dialog } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';

interface Props {
  editing?: ShiftInfo;
  creating?: boolean;
  onClose?: () => void;
}

export default function ShiftDialog({ creating = false, editing = undefined, onClose }: Props) {
  const open = creating || Boolean(editing);
  const t = useTranslations('ShiftDialog');
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <Dialog.Content className={styles.fullScreenDialog}>
        <Dialog.Title>{t(editing ? 'editShift' : 'addShift')}</Dialog.Title>
        <Dialog.Close>
          <Button>{t('cancel')}</Button>
        </Dialog.Close>
        <Button>{t('save')}</Button>
      </Dialog.Content>
    </Dialog.Root>
  );
}
