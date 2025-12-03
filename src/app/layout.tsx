/**
 * Root layout component for the whole application.
 * @since 2025-09-02
 * @author Michael Townsend <@continuities>
 */

import type { Metadata } from 'next';
import './globals.css';
import '@radix-ui/themes/styles.css';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Theme, Container } from '@radix-ui/themes';
import NavBar from '@/ui/navbar';

export const metadata: Metadata = {
  title: process.env.APP_NAME,
  description: 'A system to support the organisation of alternative arts events'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class">
            <Theme>
              <Container>
                <NavBar text={process.env.APP_NAME} />
                <main>{children}</main>
              </Container>
            </Theme>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
