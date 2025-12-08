/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { IconButton, Heading, Text } from '@radix-ui/themes';
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import styles from './styles.module.css';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const navLinkMap = new Map<string, string>([
  ['/', 'dashboard'],
  ['/event', 'event'],
  ['/team', 'teams'],
  ['/users', 'users'],
  ['/settings', 'settings']
]);

interface Props {
  text?: string;
}

export default function NavBar({ text }: Props) {
  const t = useTranslations('NavBar');
  const [dialogOpen, setDialogOpen] = useState(false);

  const getNavItems = (isInDialog: boolean) =>
    Array.from(navLinkMap.entries()).map(([path, title]) => (
      <NavigationMenu.Item
        key={path}
        className={
          isInDialog
            ? `${styles.navigationMenuItem} ${styles.navigationMenuItemInDialog}`
            : styles.navigationMenuItem
        }
      >
        <NavigationMenu.Link asChild>
          <Link href={path} className={styles.link} onClick={() => setDialogOpen(false)}>
            <Text>{t(title)}</Text>
          </Link>
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    ));

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <NavigationMenu.Root>
        <NavigationMenu.List className={styles.navigationMenuList}>
          <Heading size="3">{text}</Heading>
          {getNavItems(false)}
          <Dialog.Trigger asChild>
            <IconButton
              variant="ghost"
              size="3"
              aria-label="Menu"
              className={styles.navigationHamburgerMenuIcon}
            >
              <HamburgerMenuIcon />
            </IconButton>
          </Dialog.Trigger>
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Close asChild className={styles.dialogCloseButton}>
              <IconButton variant="ghost" size="3" aria-label="Close">
                <Cross1Icon />
              </IconButton>
            </Dialog.Close>
            <VisuallyHidden.Root>
              <Dialog.Title>{text}</Dialog.Title>
              <Dialog.Description>{t('screenReaderDialogDescription')}</Dialog.Description>
            </VisuallyHidden.Root>
            {getNavItems(true)}
          </Dialog.Content>
        </NavigationMenu.List>
        <NavigationMenu.Viewport />
      </NavigationMenu.Root>
    </Dialog.Root>
  );
}
