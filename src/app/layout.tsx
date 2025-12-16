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
import { Theme, Container } from '@radix-ui/themes';
import NavBar from '@/ui/navbar';
import { currentUser } from '@/session';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getEventBySlug } from '@/service/event-service';
import { getEventDateRangeDisplayText } from '@/utils/date';

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

  // Get the current pathname from middleware header to check if we're on an event page
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Extract event slug from pathname if it matches /event/[eventSlug] pattern
  let navBarTitle = process.env.APP_NAME;
  let navBarSubtitle = undefined;
  const eventMatch = pathname.match(/^\/event\/([^\/]+)/);
  if (eventMatch) {
    const eventSlug = eventMatch[1];
    const event = await getEventBySlug(eventSlug);
    if (event) {
      navBarTitle = event.name;
      navBarSubtitle = getEventDateRangeDisplayText({ event });
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme={(process.env.DEFAULT_THEME as ThemeMode) || 'system'}
          >
            <Theme>
              <Container>
                {user && <NavBar title={navBarTitle} subtitle={navBarSubtitle} user={user} />}
                <main>{children}</main>
              </Container>
            </Theme>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
