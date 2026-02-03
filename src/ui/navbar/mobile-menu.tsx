'use client';

import {
  IconButton,
  Dialog,
  VisuallyHidden
} from '@radix-ui/themes';
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';
import NavColumn from './nav-column';

interface MobileMenuProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
}

export default function MobileMenu({ dialogOpen, setDialogOpen, title }: MobileMenuProps) {
  const t = useTranslations('NavBar');
  
  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Trigger>
        <IconButton
          variant="ghost"
          size="3"
          aria-label="Menu"
          className={styles.navigationIconButton}
        >
          <HamburgerMenuIcon className={styles.navigationHamburgerMenuIcon} />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content className={styles.dialogContent}>
        <Dialog.Close className={styles.dialogCloseButton}>
          <IconButton variant="ghost" size="3" aria-label="Close">
            <Cross1Icon />
          </IconButton>
        </Dialog.Close>
        <VisuallyHidden>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{t('screenReaderDialogDescription')}</Dialog.Description>
        </VisuallyHidden>
        <NavColumn title={title} onClose={() => setDialogOpen(false)} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
