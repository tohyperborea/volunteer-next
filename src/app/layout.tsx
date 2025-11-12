/**
 * Root layout component for the whole application.
 * @since 2025-09-02
 * @author Michael Townsend <@continuities>
 */

import type { Metadata } from 'next';
import './globals.css';
import '@radix-ui/themes/styles.css';
import { ThemeProvider } from 'next-themes';
import { Theme, Container } from '@radix-ui/themes';
import NavBar from '@/ui/navbar';

export const metadata: Metadata = {
  title: 'volunteer-next',
  description: 'A system to support the organisation of alternative arts events'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class">
          <Theme>
            <Container>
              <NavBar />
              <main>{children}</main>
            </Container>
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
