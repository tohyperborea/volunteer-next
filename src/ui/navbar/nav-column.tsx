/**
 * Navigation column component for the navigation menu
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import {
  Text,
  TabNav,
  Box
} from '@radix-ui/themes';
import { HomeIcon } from '@radix-ui/react-icons';
import styles from './styles.module.css';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const navLinkMap = new Map<string, string>([
  ['/event', 'event'],
  ['../team', 'teams'],
  ['/users', 'users'],
  ['/settings', 'settings']
]);

interface NavColumnProps {
  title?: string;
  onClose?: () => void;
}

export default function NavColumn({ title, onClose }: NavColumnProps) {
  const t = useTranslations('NavBar');
  const router = useRouter();
  const pathname = usePathname();

  const isLastItem = (title: string) => {
    return title === Array.from(navLinkMap.values()).pop();
  };

  return (
    <TabNav.Root className={styles.navigationMenuListInner}>
      <TabNav.Link
        key="/"
        asChild
        className={`${styles.navigationMenuItem} ${styles.navigationHomeMenuItem}`}
        onClick={() => {
          onClose?.();
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
            onClose?.();
            router.push(path);
          }}
          active={pathname === path}
        >
          <Text>{t(title)}</Text>
        </TabNav.Link>
      ))}
    </TabNav.Root>
  );
}
