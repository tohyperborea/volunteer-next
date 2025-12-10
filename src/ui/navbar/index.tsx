/**
 * Global navigation bar component
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import {
  IconButton,
  Heading,
  Text,
  Dialog,
  VisuallyHidden,
  TabNav,
  Flex,
  Box
} from '@radix-ui/themes';
import { Cross1Icon, HamburgerMenuIcon, HomeIcon } from '@radix-ui/react-icons';
import styles from './styles.module.css';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const navLinkMap = new Map<string, string>([
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
  const router = useRouter();
  const isLastItem = (title: string) => {
    return title === Array.from(navLinkMap.values()).pop();
  };
  const pathname = usePathname();
  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <TabNav.Root className={styles.navigationMenuList}>
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
        <Flex direction="row" justify="center" align="center" style={{ flex: 1 }}>
          <Heading size="3">{text}</Heading>
        </Flex>
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Close className={styles.dialogCloseButton}>
            <IconButton variant="ghost" size="3" aria-label="Close">
              <Cross1Icon />
            </IconButton>
          </Dialog.Close>
          <VisuallyHidden>
            <Dialog.Title>{text}</Dialog.Title>
            <Dialog.Description>{t('screenReaderDialogDescription')}</Dialog.Description>
          </VisuallyHidden>
          <TabNav.Link
            key="/"
            asChild
            className={`${styles.navigationMenuItem} ${styles.navigationHomeMenuItem}`}
            onClick={() => {
              setDialogOpen(false);
              router.push('/');
            }}
            active={pathname === '/'}
          >
            <Box>
              <HomeIcon className={styles.navigationHomeIcon} />
              <Text style={{ marginLeft: '0.5rem' }}>{t('home')}</Text>
            </Box>
          </TabNav.Link>
          {Array.from(navLinkMap.entries()).map(([path, title]) => (
            <TabNav.Link
              key={path}
              asChild
              className={`${styles.navigationMenuItem} ${isLastItem(title) ? styles.navigationHomeMenuItem : ''}`}
              onClick={() => {
                setDialogOpen(false);
                router.push(path);
              }}
              active={pathname === path}
            >
              <Text>{t(title)}</Text>
            </TabNav.Link>
          ))}
        </Dialog.Content>
      </TabNav.Root>
    </Dialog.Root>
  );
}
