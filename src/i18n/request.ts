/**
 * Request-scoped configuration object for next-intl
 * https://next-intl.dev/docs/getting-started/app-router#i18n-request
 *
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // TODO: Static for now, we'll change this later
  const locale = 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
