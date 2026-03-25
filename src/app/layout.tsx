/**
 * Root layout component for the whole application.
 * @since 2025-09-02
 * @author Michael Townsend <@continuities>
 */

import type { Metadata } from 'next';
import './globals.css';
import '@radix-ui/themes/styles.css';
import './theme-overrides.css';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { Theme, Flex } from '@radix-ui/themes';
import NavigationFrame from '@/ui/navigation-frame';
import { currentUser, getCurrentEvent } from '@/session';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getEventBySlug } from '@/service/event-service';
import { getEventDateRangeDisplayText } from '@/utils/date';
import { userToVolunteer } from '@/lib/volunteer';
import { getPermissionsProfile } from '@/utils/permissions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  return {
    title: process.env.APP_NAME,
    description: t('description')
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const event = await getCurrentEvent();

  const navBarTitle = event ? event.name : process.env.APP_NAME;
  const navBarSubtitle = event ? getEventDateRangeDisplayText({ event }) : undefined;

  const mainContent = (
    <Flex asChild direction="column" p="4">
      <main>{children}</main>
    </Flex>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme={(process.env.DEFAULT_THEME as ThemeMode) || 'system'}
          >
            <Theme>
              {user ? (
                <NavigationFrame
                  title={navBarTitle}
                  subtitle={navBarSubtitle}
                  currentUser={userToVolunteer(user, getPermissionsProfile(user))}
                >
                  {mainContent}
                </NavigationFrame>
              ) : (
                mainContent
              )}
            </Theme>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
