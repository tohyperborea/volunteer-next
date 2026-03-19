/**
 * Just the team tabs for admins
 * @since 2026-03-18
 * @author Michael Townsend <@continuities>
 */

'use client';

import { TabNav } from '@radix-ui/themes';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Props {
  infoPath: string;
  shiftsPath: string;
  volunteersPath: string;
}

export default function TeamTabs({ infoPath, shiftsPath, volunteersPath }: Props) {
  const path = usePathname();
  const t = useTranslations('TeamPage');
  return (
    <TabNav.Root>
      <TabNav.Link active={path === infoPath} asChild>
        <NextLink href={infoPath}>{t('tabs.team')}</NextLink>
      </TabNav.Link>
      <TabNav.Link active={path === shiftsPath} asChild>
        <NextLink href={shiftsPath}>{t('tabs.shifts')}</NextLink>
      </TabNav.Link>
      <TabNav.Link active={path === volunteersPath} asChild>
        <NextLink href={volunteersPath}>{t('tabs.volunteers')}</NextLink>
      </TabNav.Link>
    </TabNav.Root>
  );
}
