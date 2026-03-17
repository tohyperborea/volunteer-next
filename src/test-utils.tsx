/**
 * Wrapper for @testing-library/react that includes all of our providers
 * and is used to render components in our tests.
 * @since 2026-03-16
 * @author Michael Townsend <@continuities>
 */

import { render, type RenderOptions } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';

const Providers = ({ children }: { children: React.ReactNode }) => <Theme>{children}</Theme>;

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
