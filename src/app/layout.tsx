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
import { Theme, Container } from '@radix-ui/themes';
import NavBar from '@/ui/navbar';

export const metadata: Metadata = {
  title: process.env.APP_NAME,
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
        <NextIntlClientProvider>
          <ThemeProvider attribute="class">
            <Theme>
              <Container>
                <NavBar text={process.env.APP_NAME} />
                <main>{children}</main>
              </Container>
            </Theme>
          </ThemeProvider>
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fix for Radix UI Select accessibility: prevent hidden selects from receiving focus
              (function() {
                const processed = new WeakSet();
                function preventHiddenSelectFocus() {
                  const hiddenSelects = document.querySelectorAll('select[aria-hidden="true"]');
                  hiddenSelects.forEach(function(select) {
                    if (processed.has(select)) return;
                    processed.add(select);
                    
                    if (document.activeElement === select) {
                      select.blur();
                    }
                    // Prevent focus events
                    select.addEventListener('focus', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      this.blur();
                    }, { capture: true, passive: false });
                    // Ensure tabindex is set
                    if (select.getAttribute('tabindex') !== '-1') {
                      select.setAttribute('tabindex', '-1');
                    }
                  });
                }
                // Run on DOMContentLoaded and after mutations
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', preventHiddenSelectFocus);
                } else {
                  preventHiddenSelectFocus();
                }
                // Watch for dynamically added selects
                const observer = new MutationObserver(preventHiddenSelectFocus);
                observer.observe(document.body, { childList: true, subtree: true });
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
